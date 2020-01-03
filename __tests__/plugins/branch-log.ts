import fs from 'fs'
import path from 'path'

import { parse, traverse } from '../../src/lib'
import BranchLogPlugin from '../../src/plugins/branch-log'
import { NodePath } from '../../src/traverser/path'
import { d } from '../../src/nodes'

const code = fs.readFileSync(
  path.resolve('__tests__/__fixture__/rough.vcl'),
  'utf8'
)
const ast = parse(code)

describe('BranchLogPlugin', () => {
  it('should create Branch-Log nodes inside each branch', () => {
    BranchLogPlugin(ast)

    traverse(ast, {
      entry({ node }: NodePath<d.SubroutineStatement | d.IfStatement>) {
        if (node.is('SubroutineStatement')) {
          const loggerNode = node.body[0]

          expect(loggerNode).toMatchObject({
            type: 'AddStatement',
            left: { member: { name: 'Branch-Log' } },
          } as d.AddStatement)
        } else if (node.is('IfStatement')) {
          const loggerNode = node.consequent[0]

          expect(loggerNode).toMatchObject({
            type: 'AddStatement',
            left: { member: { name: 'Branch-Log' } },
          } as d.AddStatement)
        }
      },
    })

    // console.log(generate(ast).code)
  })
})
