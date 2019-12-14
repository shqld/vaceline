import { resolve as resolvePath } from 'path'
import { existsSync, readFileSync } from 'fs'
import assert from 'assert'

import {
  parse,
  generate,
  // traverse,
} from './lib'
import { Program } from './nodes'

interface TransformResult {
  code: string
  map: string
  ast: Program
}

export { parse, generate as transformFromAst }

export const transform = (code: string /*, options = {}*/): TransformResult => {
  const ast = parse(code)

  const result: Partial<TransformResult> = generate(ast)

  result.ast = ast

  return result as TransformResult
}

export const transformFile = (
  filePath: string
  // options = {}
): TransformResult => {
  const inputPath = resolvePath(filePath)
  assert(existsSync(inputPath), 'File not found: ' + inputPath)

  const ast = parse(readFileSync(filePath, 'utf8'))
  const result: Partial<TransformResult> = generate(ast)

  result.ast = ast

  return result as TransformResult
}
