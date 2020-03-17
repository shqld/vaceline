import { traverse } from '../../lib'
import { d } from '../../nodes'
import {
  buildMember,
  buildIdentifier,
  buildSetStatement,
  buildStringLiteral,
  buildAddStatement,
  buildFunCallExpression,
  buildExpressionStatement,
} from '../../nodes/builders.gen'
import { Node } from '../../nodes/defs'

// req.http.Vaceline-Branch-Log
const varBranchLog = buildMember(
  buildMember(buildIdentifier('req'), buildIdentifier('http')),
  buildIdentifier('Vaceline-Branch-Log')
)

const getLoc = (node: Node) =>
  node.loc ? `${node.loc.start.line}:${node.loc.start.column}` : 'synthethic'

export default (ast: d.Node) => {
  traverse(ast, {
    entry({ node }) {
      if (node.is('SubroutineStatement')) {
        if (node.id.name === 'vcl_recv') {
          node.body.unshift(
            /**
             * set req.http.Vaceline-Branch-Log = "(vcl_recv)${line}:${col}";
             */
            buildSetStatement(
              varBranchLog,
              buildStringLiteral(`"(${node.id.name})${getLoc(node)}"`),
              '='
            )
          )
        } else {
          node.body.unshift(
            /**
             * add req.http.Vaceline-Branch-Log = "(${nodeName})${line}:${col}";
             */
            buildAddStatement(
              varBranchLog,
              buildStringLiteral(`"(${node.id.name})${getLoc(node)}"`),
              '='
            )
          )
        }

        if (node.id.name === 'vcl_deliver') {
          node.body.push(
            /**
             * set resp.http.Vaceline-Branch-Log = std.collect(
             *   req.http.Vaceline-Branch-Log
             * );
             */
            buildExpressionStatement(
              buildFunCallExpression(
                buildMember(buildIdentifier('std'), buildIdentifier('collect')),
                [varBranchLog]
              )
            ),
            buildSetStatement(
              buildMember(
                buildMember(buildIdentifier('resp'), buildIdentifier('http')),
                buildIdentifier('Vaceline-Branch-Log')
              ),
              buildMember(
                buildMember(buildIdentifier('req'), buildIdentifier('http')),
                buildIdentifier('Vaceline-Branch-Log')
              ),
              '='
            )
          )
        }
      } else if (node.is('IfStatement')) {
        node.consequent.unshift(
          /**
           * add req.http.Vaceline-Branch-Log = "${line}:${col}";
           */
          buildAddStatement(
            varBranchLog,
            buildStringLiteral(
              node.loc
                ? `"(anonymous)${node.loc.start.line}:${node.loc.start.column}"`
                : '"synthethic"'
            ),
            '='
          )
        )
      }
    },
  })
}
