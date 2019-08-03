import { Node } from '../nodes'
import * as n from '../ast-nodes.d'
import { isToken } from '../utils/token'

import { Token } from './tokenizer'
import { NodeWithLoc } from '../nodes/node'
import { createError } from './create-error'
import { parseLiteral } from './literal'
import * as ops from './tokenizer/operators'
import { Parser } from '.'

interface Stack<T> {
  [I: number]: T
  push: Array<T>['push']
  pop: Array<T>['pop']
  length: Array<T>['length']
}

export const parseExpr = (
  p: Parser,
  token: Token = p.read(),
  shortcut = false
): n.Expression => {
  const expr = parseOperatorExpr(p, token)

  if (shortcut) return expr

  const node = p.startNode()

  if (isToken(token, 'symbol', ';')) {
    return expr
  }

  let backup = p.getCursor()

  const buf = [expr]

  while (!p.isEOF()) {
    const token = p.read()

    if (isToken(token, 'symbol', ';')) {
      break
    }

    try {
      buf.push(parseHumbleExpr(p, token))
      backup = p.getCursor()
    } catch (err) {
      if (err instanceof SyntaxError) {
        break
      } else {
        throw err
      }
    }
  }

  // backtrack to the backed-up cursor
  p.jumpTo(backup)

  // the next token wasn't an expression
  if (buf.length === 1) {
    return expr
  }

  return p.finishNode(node, 'ConcatExpression', {
    body: buf,
  })
}

const parseOperatorExpr = (
  p: Parser,
  token: Token = p.read(),
  shortcut = false
): n.Expression => {
  const expr = parseHumbleExpr(p, token)

  if (shortcut) return expr

  if (isToken(token, 'symbol', ';')) {
    return expr
  }

  // let node = p.startNode()
  let backup = p.getCursor()

  type Operator = Token & {
    type: 'operator'
    precedence: number
    isBinary: boolean
  }

  const rpn: Array<n.Expression | Operator> = [expr]
  const opStack: Stack<Operator> = []

  // covert expression sequence into rpn
  while (!p.isEOF()) {
    const op = p.peek()! as Operator

    const isBinary = ops.binary.has(op.value)
    const isLogical = !isBinary && ops.logical.has(op.value)

    if (!isBinary && !isLogical) break

    p.take()

    op.precedence = ops.getPrecedence(op.value)
    op.isBinary = isBinary

    while (op.precedence >= (opStack[opStack.length - 1] || {}).precedence) {
      rpn.push(opStack.pop()!)
    }

    opStack.push(op)

    try {
      rpn.push(parseHumbleExpr(p))
    } catch (err) {
      if (err instanceof SyntaxError) {
        p.jumpTo(backup)
        break
      }
      throw err
    }

    backup = p.getCursor()
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

  if (stack.length !== 1) {
    throw new Error()
  }

  return stack[0]
}

const parseHumbleExpr = (
  p: Parser,
  token: Token = p.read(),
  node: NodeWithLoc = p.startNode()
): n.Expression => {
  const literal = parseLiteral(p, token)

  if (literal) return literal

  if (token.type === 'identifier') {
    if (isToken(p.peek(), 'symbol', '(')) {
      const ident = p.startNode()

      const callee = p.finishNode(ident, 'Identifier', {
        name: token.value,
      })

      p.take()

      const args: Array<n.Expression> = []

      while (true) {
        args.push(parseExpr(p))

        if (isToken(p.peek(), 'symbol', ')')) {
          p.take()
          break
        }

        p.validateToken(p.read(), 'symbol', ',')
      }

      return p.finishNode(node, 'FunCallExpression', {
        callee,
        arguments: args,
      })
    }

    return p.finishNode(node, 'Identifier', { name: token.value })
  }

  if (token.type === 'symbol') {
    if (token.value === '(') {
      const body = parseExpr(p)
      p.validateToken(p.read(), 'symbol', ')')

      return p.finishNode(node, 'BooleanExpression', {
        body,
      })
    }
  }

  if (token.type === 'operator') {
    if (token.value === '!') {
      return p.finishNode(node, 'UnaryExpression', {
        argument: parseExpr(p),
        operator: token.value,
      })
    }
  }

  throw createError(
    p.source,
    '[expr] not implemented yet',
    node.loc.start,
    node.loc.end
  )
}
