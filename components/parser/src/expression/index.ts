import { Expression, Located } from '@vaceline/types'

import { isToken, Token } from '../tokenizer'
import { Parser } from '..'
import { parseOperatorExpr } from './operator'
import { parseHumbleExpr } from './humble'

// import { buildDebug } from '@vaceline/utils'
// const debug = buildDebug('parser', 'expression')

export interface Stack<T> {
  [I: number]: T
  push: Array<T>['push']
  pop: Array<T>['pop']
  length: Array<T>['length']
}

export function parseExpr(
  p: Parser,
  token: Token = p.read(),
  shortcut = false
): Located<Expression> {
  const expr = parseOperatorExpr(p, token)

  if (shortcut) return expr

  if (isToken(token, 'symbol', ';')) {
    return expr
  }

  return p.parseNode(p.getCurrentToken(), () => {
    let backup = p.getCursor()

    const buf = [expr]

    let nextToken = p.peek()

    while (nextToken) {
      p.take()

      if (isToken(nextToken, 'symbol', ';')) {
        break
      }

      if (isToken(nextToken, 'symbol', '+')) {
        nextToken = p.read()
      }

      try {
        const expr = parseHumbleExpr(p, nextToken)
        buf.push(expr)
        backup = p.getCursor()
      } catch (err) {
        if (err instanceof SyntaxError) {
          break
        } else {
          throw err
        }
      }

      nextToken = p.peek()
    }

    // backtrack to the backed-up cursor
    p.jumpTo(backup)

    // the next token wasn't an expression
    if (buf.length === 1) {
      return expr
    }

    return { type: 'ConcatExpression', body: buf }
  })
}
