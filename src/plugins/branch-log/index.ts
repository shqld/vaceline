import { traverse } from '../..'
import {
  Node,
  StringLiteral,
  IfStatement,
  SubroutineStatement,
  AddStatement,
  MemberExpression,
  SetStatement,
} from '../../nodes'
import { hydrate } from '../../hydrate'
import { NodePath } from '../../traverser/path'

const variable = (obj: 'req' | 'resp') =>
  hydrate(`{
  "type": "MemberExpression",
  "object": {
    "type": "Identifier",
    "name": "${obj}"
  },
  "property": {
    "type": "MemberExpression",
    "object": {
      "type": "Identifier",
      "name": "http"
    },
    "property": {
      "type": "Header",
      "name": "Branch-Log"
    }
  }
}`) as MemberExpression

const collectLogs = hydrate(`{
  "type": "FunCallExpression",
  "callee": {
    "type": "MemberExpression",
    "object": {
      "type": "Identifier",
      "name": "std"
    },
    "property": {
      "type": "Identifier",
      "name": "collect"
    }
  }
}`)

export default (ast: Node) => {
  traverse(ast, {
    entry({ node }) {
      if (node instanceof SubroutineStatement) {
        const loggerNode =
          node.id.name === 'vcl_deliver'
            ? SetStatement.create({
                operator: '=',
                left: variable('resp'),
                right: StringLiteral.create({ value: 'std.collect(std)' }),
              })
            : AddStatement.create({
                operator: '=',
                left: variable('req'),
                right: StringLiteral.create({ value: node.id.name }),
              })

        node.body.body.unshift(loggerNode)
      } else if (node instanceof IfStatement) {
        const loggerNode = AddStatement.create({
          operator: '=',
          left: variable('req'),
          right: StringLiteral.create({
            value: `${node.loc!.start.line}:${node.loc!.start.column}`,
          }),
        })

        node.consequent.body.unshift(loggerNode)
      }
    },
  })
}
