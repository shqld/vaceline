import { traverse } from '../../lib'
import * as d from '../../nodes'
import { Node } from '../../nodes'

// req.http.Vaceline-Branch-Log
const varBranchLog = d.Member.create({
  base: d.Member.create({
    base: d.Identifier.create({ name: 'req' }),
    member: d.Identifier.create({ name: 'http' }),
  }),
  member: d.Identifier.create({ name: 'Vaceline-Branch-Log' }),
})

const getLoc = (node: Node) =>
  node.loc ? `${node.loc.start.line}:${node.loc.start.column}` : 'synthethic'

export default (ast: d.Node) => {
  traverse(ast, {
    entry({ node }) {
      if (node instanceof d.SubroutineStatement) {
        if (node.id.name === 'vcl_recv') {
          node.body.unshift(
            /**
             * set req.http.Vaceline-Branch-Log = "(vcl_recv)${line}:${col}";
             */
            d.SetStatement.create({
              operator: '=',
              left: varBranchLog,
              right: d.StringLiteral.create({
                value: `"(${node.id.name})${getLoc(node)}"`,
              }),
            })
          )
        } else {
          node.body.unshift(
            /**
             * add req.http.Vaceline-Branch-Log = "(${nodeName})${line}:${col}";
             */
            d.AddStatement.create({
              operator: '=',

              left: varBranchLog,
              right: d.StringLiteral.create({
                value: `"(${node.id.name})${getLoc(node)}"`,
              }),
            })
          )
        }

        if (node.id.name === 'vcl_deliver') {
          node.body.push(
            /**
             * set resp.http.Vaceline-Branch-Log = std.collect(
             *   req.http.Vaceline-Branch-Log
             * );
             */
            d.ExpressionStatement.create({
              body: d.FunCallExpression.create({
                callee: d.Member.create({
                  base: d.Identifier.create({ name: 'std' }),
                  member: d.Identifier.create({ name: 'collect' }),
                }),
                args: [varBranchLog],
              }),
            }),
            d.SetStatement.create({
              operator: '=',
              left: d.Member.create({
                base: d.Member.create({
                  base: d.Identifier.create({ name: 'resp' }),
                  member: d.Identifier.create({ name: 'http' }),
                }),
                member: d.Identifier.create({ name: 'Vaceline-Branch-Log' }),
              }),
              right: d.Member.create({
                base: d.Member.create({
                  base: d.Identifier.create({ name: 'req' }),
                  member: d.Identifier.create({ name: 'http' }),
                }),
                member: d.Identifier.create({ name: 'Vaceline-Branch-Log' }),
              }),
            })
          )
        }
      } else if (node instanceof d.IfStatement) {
        node.consequent.unshift(
          /**
           * add req.http.Vaceline-Branch-Log = "${line}:${col}";
           */
          d.AddStatement.create({
            operator: '=',
            left: varBranchLog,
            right: d.StringLiteral.create({
              value: node.loc
                ? `"(anonymous)${node.loc.start.line}:${node.loc.start.column}"`
                : '"synthethic"',
            }),
          })
        )
      }
    },
  })
}
