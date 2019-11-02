import fs from 'fs'
import path from 'path'

import { generate } from '../../src/generator'
import { parse } from '../../src'
import { getJoinedRegExp } from '../../src/parser/tokenizer'

const splitters = [
  /* spaces         */ / +/,
  /* tabs           */ /\t+/,
  /* newline        */ '\n',
  /* line comment   */ /#[^\n]*|\/\/[^\n]*/,
  /* inline comment */ /\/\*[\s\S]*\*\//,
  /* string         */ /"[^\n]*?"/,
  /* multiline str  */ /{"[\s\S]*?"}/,
  /* ident          */ /[A-z][A-z\d-_]*/,
  /* numeric        */ /[\d][\d.]+/,
]
const reSplitter = new RegExp('(' + getJoinedRegExp(splitters) + ')')

// This helper
// - excludes
//   - empty string (we should care this only when comparing arrays)
//   - whitespace (to ignore indents, indirectly because retaining lines is not supported)
//   - newline (retaining lines is not supported yet)
//   - comment (generating comment is not supported yet)
// - converts string into array for readability of test results
const excludeSomeTokensAndConvertIntoArray = (code: string): Array<string> =>
  code
    .split(reSplitter)
    .filter(
      (str) =>
        str && !/ /.test(str) && str !== '\n' && !/^(#|\/\/|\/\*)/.test(str)
    )

describe('Generator', () => {
  const code = fs.readFileSync(
    path.resolve('__tests__/__fixture__/rough.vcl'),
    'utf8'
  )
  // const rawAst = fs.readFileSync(path.resolve('__tests__/__fixture__/test_ast.json'), 'utf8')
  // const ast = hydrate(rawAst)
  const ast = parse(code)

  it('should', () => {
    const result = generate(ast)

    expect(result).toBeDefined()
    expect(result.code).toBeDefined()
    // expect(result.map).toBeDefined()

    // expect(result.rawMappings).toBeDefined()

    expect(excludeSomeTokensAndConvertIntoArray(result.code)).toMatchObject(
      excludeSomeTokensAndConvertIntoArray(code)
    )
  })
})
