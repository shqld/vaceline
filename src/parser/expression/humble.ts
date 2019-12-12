import { Parser } from '..'
import * as n from '../../nodes'
import { Token } from '../tokenizer'
import { isToken } from '../../utils/token'
import { createError } from '../create-error'
import { parseLiteral } from '../literal'
import { parseExpr } from '.'
import { parseCompound } from '../compound'
import { parseIdentifier } from './identifier'

export const parseHumbleExpr = (
  p: Parser,
  token: Token = p.read(),
  node: n.NodeWithLoc = p.startNode()
): n.NodeWithLoc<n.Expression> => {
  const literal = parseLiteral(p, token)

  if (literal) return literal

  if (token.type === 'ident') {
    const ident = parseIdentifier(p, token)

    if (isToken(p.peek(), 'symbol', '(')) {
      p.take()

      const args = parseCompound(p, parseExpr, ')', ',')

      return p.finishNode(n.FunCallExpression, node, {
        callee: ident,
        arguments: args,
      })
    }

    return ident
  }

  if (token.type === 'symbol') {
    if (token.value === '(') {
      const body = parseExpr(p)
      p.validateToken(p.read(), 'symbol', ')')

      return p.finishNode(n.BooleanExpression, node, {
        body,
      })
    }
  }

  if (token.type === 'operator') {
    if (token.value === '!') {
      return p.finishNode(n.UnaryExpression, node, {
        argument: parseExpr(p),
        operator: token.value,
      })
    }
  }

  throw createError(
    p.source,
    '[expr] not implemented yet',
    node.loc.start,
    node.loc.end
  )
}
