import { Located, Expression } from '@vaceline/types'
import { Parser } from '..'
import { parseExpr } from '.'
import { isToken, Token } from '../tokenizer'
import { createError } from '../create-error'
import { parseLiteral } from '../literal'
import { parseCompound } from '../compound'
import { parseId } from './identifier'

export function parseHumbleExpr(
  p: Parser,
  token: Token = p.read()
): Located<Expression> {
  const literal = parseLiteral(p, token)

  if (literal) return literal

  if (token.type === 'ident') {
    return p.parseNode(token, () => {
      const id = parseId(p, token)

      if (isToken(p.peek(), 'symbol', '(')) {
        p.take() // skip '(' symbol

        const args = parseCompound(p, parseExpr, { until: ')', delimiter: ',' })

        return {
          type: 'FunCallExpression',
          callee: id,
          args,
        }
      }

      return id
    })
  }

  if (token.type === 'symbol' && token.value === '(') {
    return p.parseNode(token, () => {
      const body = parseExpr(p)
      p.validateToken(p.read(), 'symbol', ')')

      return { type: 'BooleanExpression', body }
    })
  }

  if (token.type === 'operator' && token.value === '!') {
    return p.parseNode(token, () => {
      return {
        type: 'UnaryExpression',
        operator: token.value,
        argument: parseExpr(p),
      }
    })
  }

  throw createError(
    p.source,
    'Expression not implemented yet',
    token.loc.start,
    token.loc.end
  )
}
