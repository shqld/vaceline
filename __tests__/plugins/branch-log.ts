import fs from 'fs'
import path from 'path'

import { parse, generate, traverse } from '../../src'
import BranchLogPlugin from '../../src/plugins/branch-log'
import { NodePath } from '../../src/traverser/path'
import { SubroutineStatement, IfStatement, AddStatement } from '../../src/nodes'
import { isNode } from '../../src/utils/node'

const code = fs.readFileSync(
  path.resolve('__tests__/__fixture__/rough.vcl'),
  'utf8'
)
const ast = parse(code)

describe('BranchLogPlugin', () => {
  it('should create Branch-Log nodes inside each branch', () => {
    BranchLogPlugin(ast)

    traverse(ast, {
      entry({ node }: NodePath<SubroutineStatement | IfStatement>) {
        if (isNode(node, ['SubroutineStatement'])) {
          const loggerNode = node.body[0]

          expect(loggerNode).toMatchObject({
            type: 'AddStatement',
            left: { member: { name: 'Branch-Log' } },
          } as AddStatement)
        } else if (isNode(node, ['IfStatement'])) {
          const loggerNode = node.consequent[0]

          expect(loggerNode).toMatchObject({
            type: 'AddStatement',
            left: { member: { name: 'Branch-Log' } },
          } as AddStatement)
        }
      },
    })

    // console.log(generate(ast).code)
  })
})
