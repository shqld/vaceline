import { resolve as resolvePath } from 'path'
import { existsSync, readFileSync } from 'fs'
import assert from 'assert'

import {
  parse,
  generate,
  // traverse,
} from './lib'
import { d } from './nodes'
import { GenerateOptions } from './generator'

interface TransformResult {
  code: string
  map: string
  ast: d.Program
}

export { parse, generate as transformFromAst }

export type Options = {} & GenerateOptions

export const transform = (
  code: string,
  options: Partial<Options> = {}
): TransformResult => {
  const ast = parse(code)

  const result: Partial<TransformResult> = generate(ast, options)

  result.ast = ast

  return result as TransformResult
}

export const transformFile = (
  filePath: string,
  options: Partial<Options> = {}
): TransformResult => {
  const inputPath = resolvePath(filePath)
  assert(existsSync(inputPath), 'File not found: ' + inputPath)

  const ast = parse(readFileSync(filePath, 'utf8'))
  const result: Partial<TransformResult> = generate(ast, options)

  result.ast = ast

  return result as TransformResult
}
