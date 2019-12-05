import * as n from '../nodes'

import { Token } from './tokenizer'
import { NodeWithLoc } from '../nodes'
import { createError } from './create-error'
import { Parser } from '.'
import { isToken } from '../utils/token'
import { parseIp } from './statement/ip'

export const parseLiteral = (
  p: Parser,
  token: Token = p.read(),
  node: NodeWithLoc = p.startNode()
): n.Literal | n.Ip | null => {
  if (token.type === 'boolean') {
    return p.finishNode(n.BooleanLiteral, node, {
      value: token.value,
    })
  }

  if (token.type === 'string') {
    if (isToken(p.peek()!, 'symbol', '/')) {
      return parseIp(p, token)
    }

    return p.finishNode(n.StringLiteral, node, {
      value: token.value,
    })
  }

  if (token.type === 'numeric') {
    if (isToken(p.peek()!, 'ident', /ms|s|m|h|d|y/)) {
      return p.finishNode(n.DurationLiteral, node, {
        value: token.value + p.read().value,
      })
    }

    if (!Number.isNaN(Number(token.value))) {
      if (
        token.value.startsWith('.') ||
        (token.value.length !== 1 && token.value.startsWith('0'))
      ) {
        throw createError(
          p.source,
          'invalid number',
          node.loc.start,
          node.loc.end
        )
      }

      return p.finishNode(n.NumericLiteral, node, {
        value: token.value,
      })
    }

    throw createError(p.source, 'invalid token', node.loc.start, node.loc.end)
  }

  return null
}
