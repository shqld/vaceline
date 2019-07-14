import { traverse } from '../..'
import { Node, nodeDefs } from '../../nodes'
import { hydrate } from '../../hydrate'
import { NodePath } from '../../traverser/path'
import { Member, FunCallExpression } from '../../ast-nodes'
import { isNode } from '../../utils/node'

const variable = (obj: 'req' | 'resp') =>
  ({
    type: 'Member',
    base: {
      type: 'Member',
      base: {
        type: 'Identifier',
        name: obj,
      },
      member: {
        type: 'Identifier',
        name: 'http',
      },
    },
    member: {
      type: 'Header',
      name: 'Branch-Log',
    },
  } as Member)

const collectLogs = {
  type: 'FunCallExpression',
  callee: {
    type: 'Member',
    base: {
      type: 'Identifier',
      name: 'std',
    },
    member: {
      type: 'Identifier',
      name: 'collect',
    },
  },
} as FunCallExpression

export default (ast: Node) => {
  traverse(ast, {
    entry({ node }) {
      if (isNode(node, ['SubroutineStatement'])) {
        const loggerNode =
          node.id.name === 'vcl_deliver'
            ? Node.create('SetStatement', {
                operator: '=',
                left: variable('resp'),
                right: Node.create('StringLiteral', {
                  value: 'std.collect(std)',
                }),
              })
            : Node.create('AddStatement', {
                operator: '=',
                left: variable('req'),
                right: Node.create('StringLiteral', { value: node.id.name }),
              })

        node.body.unshift(loggerNode)
      } else if (isNode(node, ['IfStatement'])) {
        const loggerNode = Node.create('AddStatement', {
          operator: '=',
          left: variable('req'),
          right: Node.create('StringLiteral', {
            value: `${node.loc!.start.line}:${node.loc!.start.column}`,
          }),
        })

        node.consequent.unshift(loggerNode)
      }
    },
  })
}
