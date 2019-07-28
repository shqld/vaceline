import {
  Tokenizer,
  Token,
  TokenType,
  ReturnTypeToken,
  ValueTypeToken,
} from './tokenizer'
import * as n from '../ast-nodes.d'
import {
  Node,
  NodeType,
  NodeAs,
  NodeDefMap,
  ExtractNodeFromDef,
  createNode,
} from '../nodes'
import { createError } from './create-error'
import { TokenReader } from './token-reader'

import { isNode } from '../utils/node'
import { isToken, isLiteralToken, isKeywordToken } from '../utils/token'

export const parse = (source: string) => new Parser(source).parse()

const literals = {
  string: 'StringLiteral',
  boolean: 'BooleanLiteral',
  numeric: 'NumericLiteral',
  duration: 'DurationLiteral',
  ip: 'IpLiteral',
} as const

export class Parser extends TokenReader {
  source: string

  constructor(source: string, opts: { keywords?: Array<string> } = {}) {
    const tokens = new Tokenizer(source, opts).tokenize()

    super(tokens)

    this.source = source
  }

  parse() {
    // FIXME:
    return this.parseProgram()
  }

  createNode<
    T extends keyof NodeDefMap,
    D extends NodeDefMap[T],
    N extends ExtractNodeFromDef<D>,
    V extends Omit<N, keyof Node>
  >(type: T, parse: () => V): N {
    const values = parse()

    return createNode(type, values)
  }

  parseProgram(): n.Program {
    return this.createNode('Program', () => {
      const body: Array<n.Statement> = []

      while (!this.isEOF()) {
        body.push(this.parseStmt(this.read()))
      }

      return { body }
    })
  }

  parseStmt(token: Token = this.read()): n.Statement {
    const stmt = this._parseStmt(token)

    if (!isNode(stmt, ['IfStatement', 'SubroutineStatement'])) {
      this.validateToken(this.read(), 'symbol', ';')
    }

    return stmt
  }

  _parseStmt(token: Token = this.read()): n.Statement {
    if (!isKeywordToken(token)) {
      return this.createNode('ExpressionStatement', () => ({
        body: this.parseExpr(token),
      }))
    }

    if (token.value === 'set' || token.value === 'add') {
      return this.createNode(
        token.value === 'add' ? 'AddStatement' : 'SetStatement',
        () => {
          const left = this.validateNode(this.parseExpr(), ['Identifier'])
          const operator = this.validateToken(this.read(), 'operator').value
          const right = this.parseExpr()

          return {
            left,
            operator,
            right,
          }
        }
      )
    }

    if (token.value === 'unset') {
      return this.createNode('UnsetStatement', () => ({
        id: this.validateNode(this.parseExpr(), ['Identifier']),
      }))
    }

    if (token.value === 'include') {
      return this.createNode('IncludeStatement', () => ({
        module: this.validateNode(this.parseExpr(), ['StringLiteral']),
      }))
    }

    if (token.value === 'import') {
      return this.createNode('ImportStatement', () => ({
        module: this.validateNode(this.parseExpr(), ['Identifier']),
      }))
    }

    if (token.value === 'call') {
      return this.createNode('CallStatement', () => ({
        subroutine: this.validateNode(this.parseExpr(), ['Identifier']),
      }))
    }

    if (token.value === 'declare') {
      return this.createNode('DeclareStatement', () => {
        this.validateToken(this.read(), 'keyword', 'local')

        return {
          id: this.validateNode(this.parseExpr(), ['Identifier']),
          valueType: (this.validateToken(
            this.read(),
            'valueTypes'
          ) as ValueTypeToken).value,
        }
      })
    }

    if (token.value === 'return') {
      return this.createNode('ReturnStatement', () => {
        let returnActionToken: ReturnTypeToken

        // `()` can be skipped
        if (isToken(this.peek(), 'symbol', '(')) {
          this.take()
          returnActionToken = this.validateToken(this.read(), 'returnTypes')
          this.validateToken(this.read(), 'symbol', ')')
        } else {
          returnActionToken = this.validateToken(this.read(), 'returnTypes')
        }

        return {
          action: returnActionToken.value,
        }
      })
    }

    if (token.value === 'error') {
      return this.createNode('ErrorStatement', () => {
        const status = this.validateNode(this._parseExpr(), ['NumericLiteral'])

        // `message` can be void
        if (isToken(this.peek(), 'symbol', ';')) {
          return {
            status,
          }
        }

        return {
          status,
          message: this.parseExpr(),
        }
      })
    }

    if (token.value === 'restart') {
      return this.createNode('RestartStatement', () => ({}))
    }

    if (token.value === 'synthetic') {
      return this.createNode('SyntheticStatement', () => ({
        response: this.parseExpr(),
      }))
    }

    if (token.value === 'log') {
      return this.createNode('LogStatement', () => ({
        content: this.parseExpr(),
      }))
    }

    if (token.value === 'if') {
      return this.createNode('IfStatement', () => {
        this.validateToken(this.read(), 'symbol', '(')

        const test = this.parseExpr()

        this.validateToken(this.read(), 'symbol', ')')

        this.validateToken(this.read(), 'symbol', '{')

        const consequent: Array<n.Statement> = []
        while (true) {
          if (isToken(this.peek(), 'symbol', '}')) {
            this.take()
            break
          }

          consequent.push(this.parseStmt())
        }

        if (this.isEOF() || !isToken(this.peek(), 'keyword', 'else')) {
          return {
            test,
            consequent,
          }
        }

        this.take()

        let alternative: n.IfStatement | Array<n.Statement>
        if (isToken(this.peek(), 'keyword', 'if')) {
          alternative = this.validateNode(this.parseStmt(this.read()), [
            'IfStatement',
          ])
        } else {
          this.validateToken(this.read(), 'symbol', '{')

          alternative = []

          while (true) {
            if (isToken(this.peek(), 'symbol', '}')) {
              this.take()
              break
            }

            alternative.push(this.parseStmt())
          }
        }

        return {
          test,
          consequent,
          alternative,
        }
      })
    }

    if (token.value === 'sub') {
      return this.createNode('SubroutineStatement', () => {
        const id = this.validateNode(this._parseExpr(), ['Identifier'])
        this.validateToken(this.read(), 'symbol', '{')

        const body = []

        while (true) {
          if (isToken(this.peek(), 'symbol', '}')) {
            this.take()
            break
          }

          body.push(this.parseStmt())
        }

        return {
          id,
          body,
        }
      })
    }

    if (token.value === 'acl') {
      return this.createNode('AclStatement', () => {
        const id = this.validateNode(this._parseExpr(), ['Identifier'])
        this.validateToken(this.read(), 'symbol', '{')

        const body = []

        while (true) {
          if (this.validateToken(this.peek()!, 'symbol', '}')) {
            this.take()
            break
          }

          body.push(this.validateNode(this._parseExpr(), ['IpLiteral']))

          this.validateToken(this.read(), 'symbol', ',')
        }

        return {
          id,
          body,
        }
      })
    }

    throw new SyntaxError('[stmt] not implemented yet')
  }

  // TODO: too costly
  parseExpr(token: Token = this.read()): n.Expression {
    const expr = this._parseExpr(token)

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
        return this._parseConcatExpr(buf)
      }

      try {
        buf.push(this._parseExpr(token))
      } catch (err) {
        if (err instanceof SyntaxError) {
          // backtrack to the backed-up cursor
          this.jumpTo(backup)

          // the next token wasn't an expression
          return this._parseConcatExpr(buf)
        }

        throw err
      }
    }
  }

  _parseConcatExpr(buf: Array<n.Expression>) {
    if (buf.length === 1) {
      return buf[0]
    }

    // const first = buf[0]
    // const last = buf[buf.length - 1]

    return createNode('ConcatExpression', {
      body: buf,
    })
  }

  _parseExpr(token: Token = this.read()): n.Expression {
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

  validateNode<T extends Array<NodeType>>(
    node: Node,
    type: T,
    message?: string
  ): NodeAs<T[number]> {
    if (!isNode(node, type)) {
      message = 'expected ' + type.join(', ') + (message ? message : '')
      throw createError(this.source, message, node.start!, node.end!)
    }

    return node as NodeAs<T[number]>
  }

  validateToken<T extends TokenType, U extends string>(
    token: Token,
    type: T,
    value?: U
  ): Token & { type: T; value: U } {
    if (!isToken(token, type, value)) {
      throw createError(
        this.source,
        'expected ' + [type, value].join(', '),
        token.start,
        token.end
      )
    }

    return token as Token & { type: T; value: U }
  }
}
