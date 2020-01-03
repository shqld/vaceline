import { traverse } from '../../lib'
import { d } from '../../nodes'
import {
  buildMember,
  buildIdentifier,
  buildSetStatement,
  buildStringLiteral,
  buildAddStatement,
} from '../../nodes/builders.gen'

const variable = (obj: 'req' | 'resp') =>
  buildMember(
    buildMember(buildIdentifier(obj), buildIdentifier('http')),
    buildIdentifier('Branch-Log')
  )

// const collectLogs = new FunCallExpression({
//   callee: new Member({
//     base: new Identifier({
//       name: 'std',
//     }),
//     member: new Identifier({
//       name: 'collect',
//     }),
//   }),
// })

export default (ast: d.Node) => {
  traverse(ast, {
    entry({ node }) {
      if (node.is('SubroutineStatement')) {
        const loggerNode =
          node.id.name === 'vcl_deliver'
            ? buildSetStatement(
                variable('resp'),
                buildStringLiteral('std.collect(std)'),
                '='
              )
            : buildAddStatement(
                variable('req'),
                buildStringLiteral(node.id.name),
                '='
              )

        node.body.unshift(loggerNode)
      } else if (node.is('IfStatement')) {
        const loggerNode = buildAddStatement(
          variable('req'),
          buildStringLiteral(
            node.loc
              ? `${node.loc.start.line}:${node.loc.start.column}`
              : 'synthethic'
          ),
          '='
        )

        node.consequent.unshift(loggerNode)
      }
    },
  })
}
