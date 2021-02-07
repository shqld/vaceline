import { Literal, Location, Located } from '../nodes'

import { Token } from './tokenizer'
import { createError } from './create-error'
import { Parser } from '.'
import { isToken } from '../utils/token'
import { parseIp } from './statement/ip'

export function parseLiteral(
  p: Parser,
  token: Token = p.read(),
  loc: Location = p.startNode()
): Located<Literal> | null {
  if (token.type === 'boolean') {
    return p.finishNode({ type: 'BooleanLiteral', value: token.value, loc })
  }

  if (token.type === 'string') {
    if (isToken(p.peek(), 'symbol', '/')) {
      return parseIp(p, token)
    }

    return p.finishNode({ type: 'StringLiteral', value: token.value, loc })
  }

  if (token.type === 'numeric') {
    if (isToken(p.peek(), 'ident', /ms|s|m|h|d|y/)) {
      return p.finishNode({
        type: 'DurationLiteral',
        value: token.value + p.read().value,
        loc,
      })
    }

    if (!Number.isNaN(Number(token.value))) {
      if (
        token.value.startsWith('.') ||
        (token.value.length !== 1 && token.value.startsWith('0'))
      ) {
        throw createError(p.source, 'Invalid number', loc.start, loc.end)
      }

      return p.finishNode({ type: 'NumericLiteral', value: token.value, loc })
    }

    throw createError(p.source, 'Invalid token', loc.start, loc.end)
  }

  return null
}
