import { Parser } from '..'
import { d, b, NodeWithLoc, Location } from '../../nodes'
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
  loc: Location = p.startNode()
): NodeWithLoc<d.Expression> => {
  const literal = parseLiteral(p, token)

  if (literal) return literal

  if (token.type === 'ident') {
    const ident = parseIdentifier(p, token)

    if (isToken(p.peek(), 'symbol', '(')) {
      p.take()

      const args = parseCompound(p, parseExpr, ')', ',')

      return p.finishNode(b.buildFunCallExpression(ident, args, loc))
    }

    return ident
  }

  if (token.type === 'symbol') {
    if (token.value === '(') {
      const body = parseExpr(p)
      p.validateToken(p.read(), 'symbol', ')')

      return p.finishNode(b.buildBooleanExpression(body, loc))
    }
  }

  if (token.type === 'operator') {
    if (token.value === '!') {
      return p.finishNode(
        b.buildUnaryExpression(token.value, parseExpr(p), loc)
      )
    }
  }

  throw createError(p.source, '[expr] not implemented yet', loc.start, loc.end)
}
