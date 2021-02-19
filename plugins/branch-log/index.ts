import { Node } from '@vaceline/types'
import { traverse } from '@vaceline/traverser'

// req.http.Vaceline-Branch-Log
const varBranchLog: Node = {
  type: 'Member',
  base: {
    type: 'Member',
    base: { type: 'Identifier', name: 'req' },
    member: { type: 'Identifier', name: 'http' },
  },
  member: { type: 'Identifier', name: 'Vaceline-Branch-Log' },
}

const getLoc = (node: Node) =>
  node.loc ? `${node.loc.start.line}:${node.loc.start.column}` : 'synthethic'

export default (ast: Node) => {
  traverse(ast, {
    entry({ node }) {
      if (node.type === 'SubroutineStatement') {
        if (node.id.name === 'vcl_recv') {
          node.body.unshift(
            /**
             * set req.http.Vaceline-Branch-Log = "(vcl_recv)${line}:${col}";
             */
            {
              type: 'SetStatement',
              left: varBranchLog,
              right: {
                type: 'StringLiteral',
                value: `"(${node.id.name})${getLoc(node)}"`,
              },
              operator: '=',
            }
          )
        } else {
          node.body.unshift(
            /**
             * add req.http.Vaceline-Branch-Log = "(${nodeName})${line}:${col}";
             */
            {
              type: 'AddStatement',
              left: varBranchLog,
              right: {
                type: 'StringLiteral',
                value: `"(${node.id.name})${getLoc(node)}"`,
              },
              operator: '=',
            }
          )
        }

        if (node.id.name === 'vcl_deliver') {
          node.body.push(
            /**
             * set resp.http.Vaceline-Branch-Log = std.collect(
             *   req.http.Vaceline-Branch-Log
             * );
             */
            {
              type: 'ExpressionStatement',
              body: {
                type: 'FunCallExpression',
                callee: {
                  type: 'Member',
                  base: {
                    type: 'Identifier',
                    name: 'std',
                  },
                  member: { type: 'Identifier', name: 'collect' },
                },
                args: [varBranchLog],
              },
            },
            {
              type: 'SetStatement',
              left: {
                type: 'Member',
                base: {
                  type: 'Member',
                  base: { type: 'Identifier', name: 'resp' },
                  member: { type: 'Identifier', name: 'http' },
                },
                member: { type: 'Identifier', name: 'Vaceline-Branch-Log' },
              },
              right: {
                type: 'Member',
                base: {
                  type: 'Member',
                  base: { type: 'Identifier', name: 'req' },
                  member: { type: 'Identifier', name: 'http' },
                },
                member: { type: 'Identifier', name: 'Vaceline-Branch-Log' },
              },
              operator: '=',
            }
          )
        }
      } else if (node.type === 'IfStatement') {
        node.consequent.unshift(
          /**
           * add req.http.Vaceline-Branch-Log = "${line}:${col}";
           */
          {
            type: 'AddStatement',
            left: varBranchLog,
            right: {
              type: 'StringLiteral',
              value: node.loc
                ? `"(anonymous)${node.loc.start.line}:${node.loc.start.column}"`
                : '"synthethic"',
            },
            operator: '=',
          }
        )
      }
    },
  })
}
