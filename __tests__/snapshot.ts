import fs from 'fs'
import path from 'path'

import { parse } from '../src'

describe('hydrate', () => {
  const codePath = path.resolve('__tests__/__fixture__/rough.vcl')
  const code = fs.readFileSync(codePath, 'utf8')

  it('should', () => {
    const ast = parse(code)

    expect(ast).toMatchSnapshot('ast')
  })
})
