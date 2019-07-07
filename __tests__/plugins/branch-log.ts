import fs from 'fs'
import path from 'path'

import { parse, generate, traverse } from '../../src'
import BranchLogPlugin from '../../src/plugins/branch-log'
import { NodePath } from '../../src/traverser/path'
import { SubroutineStatement, AddStatement, IfStatement } from '../../src/nodes'

const code = fs.readFileSync(
  path.resolve('__tests__/__fixture__/test.vcl'),
  'utf8'
)
const ast = parse(code)

describe('BranchLogPlugin', () => {
  it('should create Branch-Log nodes inside each branch', () => {
    BranchLogPlugin(ast)

    traverse(ast, {
      entry({ node }: NodePath<SubroutineStatement | IfStatement>) {
        if (node instanceof SubroutineStatement) {
          const loggerNode = node.body.body[0]

          expect(loggerNode).toBeInstanceOf(AddStatement)
          expect(loggerNode).toHaveProperty(
            'left.property.property.name',
            'Branch-Log'
          )
        } else if (node instanceof IfStatement) {
          const loggerNode = node.consequent.body[0]

          expect(loggerNode).toBeInstanceOf(AddStatement)
          expect(loggerNode).toHaveProperty(
            'left.property.property.name',
            'Branch-Log'
          )
        }
      },
    })

    // console.log(generate(ast).code)
  })
})
