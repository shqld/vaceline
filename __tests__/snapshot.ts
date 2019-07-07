import fs from 'fs'
import path from 'path'

import { Parser } from '../src/parser'

describe('hydrate', () => {
  const code = fs.readFileSync(path.resolve('__tests__/__fixture__/test.vcl'), 'utf8')

  it('should', () => {
    const ast = Parser.Program.tryParse(code)

    expect(ast).toMatchSnapshot('ast')
  })
})
