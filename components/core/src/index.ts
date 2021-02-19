import { resolve as resolvePath } from 'path'
import { existsSync, readFileSync } from 'fs'
import assert from 'assert'

import { parse } from '@vaceline/parser'
import { generate, GenerateOptions } from '@vaceline/generator'
import { Program } from '@vaceline/types'

interface TransformResult {
  code: string
  map: string
  ast: Program
}

export { parse, generate as transformFromAst }

export type Options = {} & GenerateOptions

export function transform(
  code: string,
  options: Partial<Options> = {}
): TransformResult {
  const ast = parse(code)

  const result: Partial<TransformResult> = generate(ast, options)

  result.ast = ast

  return result as TransformResult
}

export function transformFile(
  filePath: string,
  options: Partial<Options> = {}
): TransformResult {
  const inputPath = resolvePath(filePath)
  assert(existsSync(inputPath), 'File not found: ' + inputPath)

  const ast = parse(readFileSync(filePath, 'utf8'))
  const result: Partial<TransformResult> = generate(ast, options)

  result.ast = ast

  return result as TransformResult
}
