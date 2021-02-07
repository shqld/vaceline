import { Parser } from '..'
import { Located, Location, Expression } from '../../nodes'
import { Token } from '../tokenizer'
import { isToken } from '../../utils/token'
import { createError } from '../create-error'
import { parseLiteral } from '../literal'
import { parseExpr } from '.'
import { parseCompound } from '../compound'
import { parseId } from './identifier'

export function parseHumbleExpr(
  p: Parser,
  token: Token = p.read(),
  loc: Location = p.startNode()
): Located<Expression> {
  const literal = parseLiteral(p, token)

  if (literal) return literal

  if (token.type === 'ident') {
    const ident = parseId(p, token)

    if (isToken(p.peek(), 'symbol', '(')) {
      p.take()

      const args = parseCompound(p, parseExpr, { until: ')', delimiter: ',' })

      return p.finishNode({
        type: 'FunCallExpression',
        callee: ident,
        args,
        loc,
      })
    }

    return ident
  }

  if (token.type === 'symbol') {
    if (token.value === '(') {
      const body = parseExpr(p)
      p.validateToken(p.read(), 'symbol', ')')

      return p.finishNode({ type: 'BooleanExpression', body, loc })
    }
  }

  if (token.type === 'operator') {
    if (token.value === '!') {
      return p.finishNode({
        type: 'UnaryExpression',
        operator: token.value,
        argument: parseExpr(p),
        loc,
      })
    }
  }

  throw createError(
    p.source,
    'Expression not implemented yet',
    loc.start,
    loc.end
  )
}
