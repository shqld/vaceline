import { Node } from '../nodes'
import * as n from '../ast-nodes.d'
import { isToken } from '../utils/token'

import { Token } from './tokenizer'
import { ParserBase } from './base'
import { NodeWithLoc } from '../nodes/node'
import { createError } from './create-error'
import { parseLiteral } from './literal'

const literals = {
  string: 'StringLiteral',
  boolean: 'BooleanLiteral',
  numeric: 'NumericLiteral',
  duration: 'DurationLiteral',
  ip: 'IpLiteral',
} as const

export class ExpressionParser extends ParserBase {
  // TODO: too costly
  protected parseExpr(
    token: Token = this.read(),
    shortcut = false
  ): n.Expression {
    const expr = this.parseExprBase(token)

    if (shortcut) return expr

    const node = this.startNode()

    if (token.type === 'symbol' && token.value === ';') {
      return expr
    }

    let backup: number

    const buf = [expr]

    while (!this.isEOF()) {
      backup = this.getCursor()

      const token = this.read()

      // if (token.type === 'symbol' && token.value === ';') {
      //   // backtrack to the backed-up cursor
      //   this.jumpTo(backup)

      //   // the next token wasn't an expression
      //   if (buf.length === 1) {
      //     return buf[0]
      //   }

      //   return this.finishNode(node, 'ConcatExpression', {
      //     body: buf,
      //   })
      // }

      try {
        buf.push(this.parseExprBase(token))
      } catch (err) {
        if (err instanceof SyntaxError) {
          // backtrack to the backed-up cursor
          this.jumpTo(backup)
          break
        } else {
          throw err
        }
      }
    }

    // the next token wasn't an expression
    if (buf.length === 1) {
      return buf[0]
    }

    return this.finishNode(node, 'ConcatExpression', {
      body: buf,
    })
  }

  private parseExprBase(
    token: Token = this.read(),
    node: NodeWithLoc = this.startNode()
  ): n.Expression {
    const literal = parseLiteral(this, token)

    if (literal) return literal

    if (token.type === 'identifier') {
      if (isToken(this.peek(), 'symbol', '(')) {
        const ident = this.startNode()

        const callee = this.finishNode(ident, 'Identifier', {
          name: token.value,
        })

        this.take()

        const args: Array<n.Expression> = []

        while (true) {
          args.push(this.parseExpr())

          if (isToken(this.peek(), 'symbol', ')')) {
            this.take()
            break
          }

          this.validateToken(this.read(), 'symbol', ',')
        }

        return this.finishNode(node, 'FunCallExpression', {
          callee,
          arguments: args,
        })
      }

      return this.finishNode(node, 'Identifier', { name: token.value })
    }

    if (token.type === 'symbol') {
      if (token.value === '(') {
        const body = this.parseExpr()
        this.validateToken(this.read(), 'symbol', ')')

        return this.finishNode(node, 'BooleanExpression', {
          body,
        })
      }
    }

    if (token.type === 'operator') {
      if (token.value === '!') {
        return this.finishNode(node, 'UnaryExpression', {
          argument: this.parseExpr(),
          operator: token.value,
        })
      }
    }

    throw createError(
      this.source,
      '[expr] not implemented yet',
      node.loc.start,
      node.loc.end
    )
  }
}
