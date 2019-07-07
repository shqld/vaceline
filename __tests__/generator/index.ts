import fs from 'fs'
import path from 'path'

import { Printer } from '../../src/generator/printer'
import { Parser } from '../../src/parser'

describe('Generator', () => {
  const code = fs.readFileSync(path.resolve('__tests__/__fixture__/test.vcl'), 'utf8')
  // const rawAst = fs.readFileSync(path.resolve('__tests__/__fixture__/test_ast.json'), 'utf8')
  // const ast = hydrate(rawAst)
  const ast = Parser.Program.tryParse(code)

  it('should', () => {
    const printer = new Printer()
    const result = printer.generate(ast)

    expect(result).toBeDefined()
    expect(result.code).toBeDefined()
    // expect(result.map).toBeDefined()

    // expect(result.rawMappings).toBeDefined()

    expect(result.code).toBe(code)
  })
})
