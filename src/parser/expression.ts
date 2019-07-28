import { Node } from '../nodes'
import * as n from '../ast-nodes.d'
import { isToken, isLiteralToken } from '../utils/token'

import { Token } from './tokenizer'
import { ParserBase } from './base'

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
    if (shortcut) return this.parseExprBase(token)

    const expr = this.parseExprBase(token)

    let backup: number

    const buf = [expr]

    while (!this.isEOF()) {
      backup = this.getCursor()

      const token = this.read()

      if (
        token.type !== 'operator' &&
        token.type !== 'identifier' &&
        token.type !== 'literal'
      ) {
        // backtrack to the backed-up cursor
        this.jumpTo(backup)
        // the next token can't be an expression
        return this.parseConcatExpr(buf)
      }

      try {
        buf.push(this.parseExprBase(token))
      } catch (err) {
        if (err instanceof SyntaxError) {
          // backtrack to the backed-up cursor
          this.jumpTo(backup)

          // the next token wasn't an expression
          return this.parseConcatExpr(buf)
        }

        throw err
      }
    }
  }

  private parseConcatExpr(buf: Array<n.Expression>) {
    if (buf.length === 1) {
      return buf[0]
    }

    // const first = buf[0]
    // const last = buf[buf.length - 1]

    return Node.create('ConcatExpression', {
      body: buf,
    })
  }

  private parseExprBase(token: Token = this.read()): n.Expression {
    if (isLiteralToken(token)) {
      const literalType = literals[token.literalType]

      return this.createNode(literalType, () => ({
        value: token.value,
      }))
    }

    if (token.type === 'identifier') {
      if (isToken(this.peek(), 'symbol', '(')) {
        return this.createNode('FunCallExpression', () => {
          const callee = this.createNode('Identifier', () => ({
            name: token.value,
          }))

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

          return {
            callee,
            arguments: args,
          }
        })
      }

      return this.createNode('Identifier', () => ({ name: token.value }))
    }

    if (token.type === 'symbol') {
      if (token.value === '(') {
        return this.createNode('BooleanExpression', () => {
          const body = this.parseExpr()
          this.validateToken(this.read(), 'symbol', ')')

          return {
            body,
          }
        })
      }
    }

    if (token.type === 'operator') {
      if (token.value === '!') {
        return this.createNode('UnaryExpression', () => ({
          argument: this.parseExpr(),
          operator: token.value,
        }))
      }
    }

    throw new SyntaxError('[expr] not implemented yet')
  }
}
