import * as path from 'path'
import * as fs from 'fs'
import { wrap as wrapRaw } from 'jest-snapshot-serializer-raw'
import stripAnsi from 'strip-ansi'

import { parse as parseNode, Parser } from '@vaceline/parser'
import { parseExpr } from '@vaceline/parser/src/expression/index'
import { parseStmt } from '@vaceline/parser/src/statement'
import { Tokenizer } from '@vaceline/parser/src/tokenizer'
import { generate } from '@vaceline/generator'
import { Node } from '@vaceline/types'

type Parse = (source: string) => Node

interface Args {
  source: string
  parse: Parse
  caseName: string
}

export const runSpec = (dirName: string, options: { parser?: Parse }) => {
  const suiteName = path.basename(dirName)
  const groupName = path.basename(suiteName)

  const parse = options.parser || parsers['node']

  const entries = fs
    .readdirSync(dirName)
    .map((entry) => path.join(dirName, entry))

  const vcls = entries.filter((entry) => path.extname(entry) === '.vcl')
  const errDir = entries.find(
    (entry) =>
      path.basename(entry) === 'err' && fs.statSync(entry).isDirectory()
  )
  const errs = errDir
    ? fs
        .readdirSync(errDir)
        .filter((entry) => path.extname(entry) === '.vcl')
        .map((entry) => path.join(errDir, entry))
    : []

  for (const vcl of vcls) {
    const isTodo = /\.todo/.test(vcl)

    const caseName = path.basename(vcl).replace(/(\..+)+/, '')

    if (isTodo) {
      describe(groupName, () => {
        it.todo(caseName)
      })

      continue
    }

    const source = fs.readFileSync(vcl, 'utf8').replace(/^###.*\n/g, '')
    const args = { source, parse, caseName }

    describe(groupName, () => {
      runBasicTest(args)
    })
  }

  for (const err of errs) {
    const isTodo = /\.todo/.test(err)

    const caseName = path.basename(err).replace(/(\..+)+/, '')

    if (isTodo) {
      describe(groupName, () => {
        it.todo(caseName)
      })

      continue
    }

    const source = fs.readFileSync(err, 'utf8').replace(/^###.*\n/g, '')
    const args = { source, parse, caseName }

    describe(groupName, () => {
      runErrorTest(args)
    })
  }
}

const runBasicTest = ({ caseName, parse, source }: Args) => {
  describe(caseName, () => {
    const ast = parse(source)

    it('ast', () => {
      expect(ast).toMatchSnapshot('ast')
    })

    it.todo('gen')
    // if (ast.type === 'BinaryExpression') {
    //   it.todo('gen')
    // } else {
    //   it('gen', () => {
    //     const reparsed = parse(generate(ast).code)

    //     expect(reparsed).toStrictEqual(ast)
    //   })
    // }

    it('format', () => {
      const long = generate(ast, { printWidth: Infinity }).code
      const short = generate(ast, { printWidth: 0 }).code

      if (long === short) {
        expect(wrapRaw(long)).toMatchSnapshot('format')
      } else {
        expect(wrapRaw(long)).toMatchSnapshot('format long')
        expect(wrapRaw(short)).toMatchSnapshot('format short')
      }
    })

    it('token', () => {
      expect(
        new Tokenizer(source).tokenize().map((t) => wrapRaw(t.value))
      ).toMatchSnapshot()
    })
  })
}

const runErrorTest = ({ caseName, parse, source }: Args) => {
  it(caseName, () => {
    try {
      parse(source)

      throw new Error('Function did not throw')
    } catch (err) {
      expect(wrapRaw(stripAnsi(err.message))).toMatchSnapshot()
    }
  })
}

export const parsers = {
  expr: (source: string) => parseExpr(new Parser(source)),
  stmt: (source: string) => parseStmt(new Parser(source)),
  node: parseNode.bind(null),
}
