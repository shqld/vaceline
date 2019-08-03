import { Node } from '../nodes'
import * as n from '../ast-nodes.d'
import { isToken } from '../utils/token'

import { Token } from './tokenizer'
import { ParserBase } from './base'
import { NodeWithLoc } from '../nodes/node'
import { createError } from './create-error'
import { parseLiteral } from './literal'
import * as ops from './tokenizer/operators'

interface Stack<T> {
  [I: number]: T
  push: Array<T>['push']
  pop: Array<T>['pop']
  length: Array<T>['length']
}

export class ExpressionParser extends ParserBase {
  private parseExpr(token: Token = this.read()) {
    return this.parseConcatExpr(token)
  }

  protected parseConcatExpr(
    token: Token = this.read(),
    shortcut = false
  ): n.Expression {
    const expr = this.parseOperatorExpr(token)

    if (shortcut) return expr

    const node = this.startNode()

    if (isToken(token, 'symbol', ';')) {
      return expr
    }

    let backup = this.getCursor()

    const buf = [expr]

    while (!this.isEOF()) {
      const token = this.read()

      if (isToken(token, 'symbol', ';')) {
        break
      }

      try {
        buf.push(this.parseHumbleExpr(token))
        backup = this.getCursor()
      } catch (err) {
        if (err instanceof SyntaxError) {
          break
        } else {
          throw err
        }
      }
    }

    // backtrack to the backed-up cursor
    this.jumpTo(backup)

    // the next token wasn't an expression
    if (buf.length === 1) {
      return expr
    }

    return this.finishNode(node, 'ConcatExpression', {
      body: buf,
    })
  }

  protected parseOperatorExpr(
    token: Token = this.read(),
    shortcut = false
  ): n.Expression {
    const expr = this.parseHumbleExpr(token)

    if (shortcut) return expr

    if (isToken(token, 'symbol', ';')) {
      return expr
    }

    // let node = this.startNode()
    let backup = this.getCursor()

    type Operator = Token & {
      type: 'operator'
      precedence: number
      isBinary: boolean
    }

    const rpn: Array<n.Expression | Operator> = [expr]
    const opStack: Stack<Operator> = []

    // covert expression sequence into rpn
    while (!this.isEOF()) {
      const op = this.peek()! as Operator

      const isBinary = ops.binary.has(op.value)
      const isLogical = !isBinary && ops.logical.has(op.value)

      if (!isBinary && !isLogical) break

      this.take()

      op.precedence = ops.getPrecedence(op.value)
      op.isBinary = isBinary

      while (op.precedence >= (opStack[opStack.length - 1] || {}).precedence) {
        rpn.push(opStack.pop()!)
      }

      opStack.push(op)

      try {
        rpn.push(this.parseHumbleExpr())
      } catch (err) {
        if (err instanceof SyntaxError) {
          this.jumpTo(backup)
          break
        }
        throw err
      }

      backup = this.getCursor()
    }

    while (opStack.length) {
      rpn.push(opStack.pop()!)
    }

    // calculate rpn
    const stack: Stack<n.Expression> = []

    for (let i = 0; i < rpn.length; i++) {
      const item = rpn[i]
      if (item instanceof Node) {
        stack.push(item)
        continue
      }

      const right = stack.pop()!
      const left = stack.pop()!

      const expr = Node.create(
        item.isBinary ? 'BinaryExpression' : 'LogicalExpression',
        {
          left,
          right,
          operator: item.value,
        },
        { start: left.loc!.start, end: right.loc!.end }
      )

      stack.push(expr)
    }

    // console.log(stack)

    if (stack.length !== 1) {
      throw new Error()
    }

    return stack[0]
  }

  private parseHumbleExpr(
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
