import fs from 'fs'
import path from 'path'

import { parse } from '../src'
import { hydrate } from '../src/hydrate'
import { Node } from '../src/nodes'

describe('hydrate', () => {
  const code = fs.readFileSync(
    path.resolve('__tests__/__fixture__/test.vcl'),
    'utf8'
  )
  // const rawAst = fs.readFileSync(path.resolve('__tests__/__fixture__/test_ast.json'), 'utf8')

  it('should', () => {
    const ast = parse(code)
    const hydrated = hydrate(JSON.stringify(ast))

    expect(hydrated).toBeInstanceOf(Node)
    expect(JSON.stringify(hydrated)).toMatch(JSON.stringify(ast))
  })
})
