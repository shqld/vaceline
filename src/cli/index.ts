#! /usr/bin/env node

import fs, { promises, read } from 'fs'
import path from 'path'
import assert from 'assert'
import * as stream from 'stream'
import { promisify } from 'util'

import mkdirp from 'mkdirp'
import debug from 'debug'

import { optionParser, Options } from './options'
import * as utils from './utils'

import { parse, transformFile } from '..'

// const pipeline = promisify(stream.pipeline)
const writeFile = fs.promises ? fs.promises.writeFile : promisify(fs.writeFile)

const createStream = (...strs: Array<string>) => {
  const readable = new stream.Readable()
  strs.forEach((str) => readable.push(str))
  readable.push(null)

  return readable
}

async function main() {
  const opts = optionParser.parse() as Options

  if (opts.debug === true) {
    debug.enable('vaceline:*')
  } else if (typeof opts.debug === 'string') {
    debug.enable(`vaceline:${opts.debug}:*`)
  }

  if (opts.source) {
    assert(fs.existsSync(opts.source), 'File not found: ' + opts.source)
  }

  const inputPaths = opts.source
    ? fs.statSync(opts.source).isDirectory()
      ? utils.readdirr(opts.source)
      : [opts.source]
    : ['/dev/stdin']

  const shouldOutputToFile = !!opts.d

  let writings: Array<Promise<void>>

  if (shouldOutputToFile) {
    writings = []
    if (!fs.existsSync(opts.d)) mkdirp.sync(opts.d)
  }

  for (const filePath of inputPaths) {
    const readablePath =
      filePath === '/dev/stdin'
        ? 'stdin'
        : path.relative(path.resolve(), filePath)

    console.time(readablePath)

    const output = opts.ast
      ? JSON.stringify(parse(fs.readFileSync(filePath, 'utf8')), null, 2)
      : transformFile(filePath).code

    console.timeEnd(readablePath)

    if (shouldOutputToFile) {
      const outputPath = path.join(
        opts.d,
        opts.source
          ? path.join(path.relative(path.resolve(opts.source), filePath))
          : ''
      )

      writings!.push(writeFile(outputPath, output))

      continue
    }

    await new Promise((resolve) =>
      createStream(output, '\n').pipe(
        fs
          .createWriteStream('/dev/stderr')
          .addListener('unpipe', () => resolve())
      )
    )
  }

  await Promise.all(writings!)

  console.log(`Successfully compiled ${writings!.length} files with Vaceline.`)
}

const logError = (err: Error) => console.error(err.stack)
// @ts-ignore
process.on('unhandledRejection', logError)
process.on('uncaughtException', logError)

main()
