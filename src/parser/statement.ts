import * as n from '../ast-nodes'
import { isToken, isKeywordToken } from '../utils/token'

import { ReturnTypeToken, ValueTypeToken } from './tokenizer'
import { ExpressionParser } from './expression'

export class StatementParser extends ExpressionParser {
  private ensureSemi() {
    this.validateToken(this.read(), 'symbol', ';')
  }

  protected parseStmt(
    token = this.read(),
    node = this.startNode()
  ): n.Statement {
    if (!isKeywordToken(token)) {
      const body = this.parseExpr(token)

      this.ensureSemi()

      return this.finishNode(node, 'ExpressionStatement', {
        body,
      })
    }

    if (token.value === 'set' || token.value === 'add') {
      const left = this.validateNode(this.parseExpr(), ['Identifier'])
      const operator = this.validateToken(this.read(), 'operator').value
      const right = this.parseExpr()

      this.ensureSemi()

      return this.finishNode(
        node,
        token.value === 'add' ? 'AddStatement' : 'SetStatement',
        {
          left,
          operator,
          right,
        }
      )
    }

    if (token.value === 'unset') {
      const id = this.validateNode(this.parseExpr(), ['Identifier'])

      this.ensureSemi()

      return this.finishNode(node, 'UnsetStatement', {
        id,
      })
    }

    if (token.value === 'include') {
      const module = this.validateNode(this.parseExpr(), ['StringLiteral'])

      this.ensureSemi()

      return this.finishNode(node, 'IncludeStatement', {
        module,
      })
    }

    if (token.value === 'import') {
      const module = this.validateNode(this.parseExpr(), ['Identifier'])

      this.ensureSemi()

      return this.finishNode(node, 'ImportStatement', {
        module,
      })
    }

    if (token.value === 'call') {
      const subroutine = this.validateNode(this.parseExpr(), ['Identifier'])

      this.ensureSemi()

      return this.finishNode(node, 'CallStatement', {
        subroutine,
      })
    }

    if (token.value === 'declare') {
      this.validateToken(this.read(), 'keyword', 'local')

      const id = this.validateNode(this.parseExpr(), ['Identifier'])
      const valueType = (this.validateToken(
        this.read(),
        'valueTypes'
      ) as ValueTypeToken).value

      this.ensureSemi()

      return this.finishNode(node, 'DeclareStatement', {
        id,
        valueType,
      })
    }

    if (token.value === 'return') {
      let returnActionToken: ReturnTypeToken

      // `()` can be skipped
      if (isToken(this.peek(), 'symbol', '(')) {
        this.take()
        returnActionToken = this.validateToken(this.read(), 'returnTypes')
        this.validateToken(this.read(), 'symbol', ')')
      } else {
        returnActionToken = this.validateToken(this.read(), 'returnTypes')
      }

      const action = returnActionToken.value

      this.ensureSemi()

      return this.finishNode(node, 'ReturnStatement', { action })
    }

    if (token.value === 'error') {
      const status = this.validateNode(this.parseExpr(this.read(), true), [
        'NumericLiteral',
      ])

      // `message` can be void
      if (isToken(this.peek(), 'symbol', ';')) {
        this.take()

        return this.finishNode(node, 'ErrorStatement', {
          status,
        })
      }

      const message = this.parseExpr()

      this.ensureSemi()

      return this.finishNode(node, 'ErrorStatement', {
        status,
        message,
      })
    }

    if (token.value === 'restart') {
      return this.finishNode(node, 'RestartStatement', {})
    }

    if (token.value === 'synthetic') {
      const response = this.parseExpr()

      this.ensureSemi()

      return this.finishNode(node, 'SyntheticStatement', {
        response,
      })
    }

    if (token.value === 'log') {
      const content = this.parseExpr()

      this.ensureSemi()

      return this.finishNode(node, 'LogStatement', {
        content,
      })
    }

    if (token.value === 'if') {
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
        return this.finishNode(node, 'IfStatement', {
          test,
          consequent,
        })
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

      return this.finishNode(node, 'IfStatement', {
        test,
        consequent,
        alternative,
      })
    }

    if (token.value === 'sub') {
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

      return this.finishNode(node, 'SubroutineStatement', {
        id,
        body,
      })
    }

    if (token.value === 'acl') {
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

      return this.finishNode(node, 'AclStatement', {
        id,
        body,
      })
    }

    throw new SyntaxError('[stmt] not implemented yet')
  }
}
