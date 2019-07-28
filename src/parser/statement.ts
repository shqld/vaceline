import * as n from '../ast-nodes'
import { isToken, isKeywordToken } from '../utils/token'
import { isNode } from '../utils/node'

import { Token, ReturnTypeToken, ValueTypeToken } from './tokenizer'
import { ExpressionParser } from './expression'

export class StatementParser extends ExpressionParser {
  protected parseStmt(token: Token = this.read()): n.Statement {
    const stmt = this.parseStmtBase(token)

    if (!isNode(stmt, ['IfStatement', 'SubroutineStatement'])) {
      this.validateToken(this.read(), 'symbol', ';')
    }

    return stmt
  }

  private parseStmtBase(token: Token = this.read()): n.Statement {
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
        const status = this.validateNode(this.parseExpr(this.read(), true), [
          'NumericLiteral',
        ])

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
        const id = this.validateNode(this.parseExpr(this.read(), true), [
          'Identifier',
        ])
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
        const id = this.validateNode(this.parseExpr(this.read(), true), [
          'Identifier',
        ])
        this.validateToken(this.read(), 'symbol', '{')

        const body = []

        while (true) {
          if (this.validateToken(this.peek()!, 'symbol', '}')) {
            this.take()
            break
          }

          body.push(
            this.validateNode(this.parseExpr(this.read(), true), ['IpLiteral'])
          )

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
}
