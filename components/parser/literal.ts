import { Literal, Located } from '../nodes'

import { Token } from './tokenizer'
import { createError } from './create-error'
import { Parser } from '.'
import { isToken } from '../utils/token'
import { parseIp } from './statement/ip'

export function parseLiteral(
  p: Parser,
  token: Token = p.read()
): Located<Literal> | null {
  if (token.type === 'boolean') {
    return p.parseNode(token, () => ({
      type: 'BooleanLiteral',
      value: token.value,
    }))
  }

  if (token.type === 'string') {
    if (isToken(p.peek(), 'symbol', '/')) {
      return parseIp(p, token)
    }

    return p.parseNode(token, () => ({
      type: 'StringLiteral',
      value: token.value,
    }))
  }

  if (token.type === 'numeric') {
    if (isToken(p.peek(), 'ident', /ms|s|m|h|d|y/)) {
      return p.parseNode(token, () => ({
        type: 'DurationLiteral',
        value: token.value + p.read().value,
      }))
    }

    if (!Number.isNaN(Number(token.value))) {
      if (
        token.value.startsWith('.') ||
        (token.value.length !== 1 && token.value.startsWith('0'))
      ) {
        throw createError(
          p.source,
          'Invalid number',
          token.loc.start,
          token.loc.end
        )
      }

      return p.parseNode(token, () => ({
        type: 'NumericLiteral',
        value: token.value,
      }))
    }

    throw createError(p.source, 'Invalid token', token.loc.start, token.loc.end)
  }

  return null
}
