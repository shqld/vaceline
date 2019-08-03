import { Node } from '../nodes'
import * as n from '../ast-nodes'
import { isToken } from '../utils/token'

import { Token } from './tokenizer'
import { ParserBase } from './base'
import { NodeWithLoc } from '../nodes/node'
import { createError } from './create-error'

export const parseLiteral = (
  parser: ParserBase,
  token: Token = parser.read(),
  node: NodeWithLoc = parser.startNode()
): n.Literal | null => {
  if (token.type === 'string') {
    return parser.finishNode(node, 'StringLiteral', {
      value: token.value,
    })
  }

  if (isToken(token, 'keyword', /true|false/)) {
    return parser.finishNode(node, 'BooleanLiteral', {
      value: token.value,
    })
  }

  if (token.type === 'numeric') {
    if (/(ms|s|m|h|d|y)$/.test(token.value)) {
      return parser.finishNode(node, 'DurationLiteral', {
        value: token.value,
      })
    }

    if (!Number.isNaN(Number(token.value))) {
      if (token.value.length !== 1 && token.value.startsWith('0')) {
        throw createError(
          parser.source,
          'invalid number',
          node.loc.start,
          node.loc.end
        )
      }

      return parser.finishNode(node, 'NumericLiteral', {
        value: token.value,
      })
    }

    throw createError(
      parser.source,
      'invalid token',
      node.loc.start,
      node.loc.end
    )
  }

  return null
}
