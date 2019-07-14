import fs from 'fs'
import path from 'path'

import { parse } from '../src'

describe('hydrate', () => {
  const code = fs.readFileSync(
    path.resolve('__tests__/__fixture__/test.vcl'),
    'utf8'
  )

  it('should', () => {
    const ast = parse(code)

    expect(ast).toMatchSnapshot('ast')
  })
})
