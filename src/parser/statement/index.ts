import * as n from '../../ast-nodes'
import { isToken } from '../../utils/token'

import { parseExpr } from '../expression'
import { createError } from '../create-error'
import { Parser } from '..'
import { keywords } from '../keywords'
import { parseIp } from './ip'

const ensureSemi = (p: Parser) => {
  p.validateToken(p.read(), 'symbol', ';')
}

export const parseStmt = (p: Parser): n.Statement => {
  const token = p.peek()!
  const node = p.startNode()

  if (!keywords.has(token.value)) {
    const body = parseExpr(p)

    ensureSemi(p)

    return p.finishNode(node, 'ExpressionStatement', {
      body,
    })
  }

  p.take()

  if (token.value === 'set' || token.value === 'add') {
    const left = p.validateNode(parseExpr(p), ['Identifier'])
    const operator = p.validateToken(p.read(), 'operator').value
    const right = parseExpr(p)

    ensureSemi(p)

    return p.finishNode(
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
    const id = p.validateNode(parseExpr(p), ['Identifier'])

    ensureSemi(p)

    return p.finishNode(node, 'UnsetStatement', {
      id,
    })
  }

  if (token.value === 'include') {
    const module = p.validateNode(parseExpr(p), ['StringLiteral'])

    ensureSemi(p)

    return p.finishNode(node, 'IncludeStatement', {
      module,
    })
  }

  if (token.value === 'import') {
    const module = p.validateNode(parseExpr(p), ['Identifier'])

    ensureSemi(p)

    return p.finishNode(node, 'ImportStatement', {
      module,
    })
  }

  if (token.value === 'call') {
    const subroutine = p.validateNode(parseExpr(p), ['Identifier'])

    ensureSemi(p)

    return p.finishNode(node, 'CallStatement', {
      subroutine,
    })
  }

  if (token.value === 'declare') {
    p.validateToken(p.read(), 'ident', 'local')

    const id = p.validateNode(parseExpr(p), ['Identifier'])
    const valueType = (p.validateToken(
      p.read(),
      'valueTypes'
    ) as ValueTypeToken).value

    ensureSemi(p)

    return p.finishNode(node, 'DeclareStatement', {
      id,
      valueType,
    })
  }

  if (token.value === 'return') {
    let returnActionToken: ReturnTypeToken

    // `()` can be skipped
    if (isToken(p.peek(), 'symbol', '(')) {
      p.take()
      returnActionToken = p.validateToken(p.read(), 'returnTypes')
      p.validateToken(p.read(), 'symbol', ')')
    } else {
      returnActionToken = p.validateToken(p.read(), 'returnTypes')
    }

    const action = returnActionToken.value

    ensureSemi(p)

    return p.finishNode(node, 'ReturnStatement', { action })
  }

  if (token.value === 'error') {
    const status = p.validateNode(parseExpr(p, p.read(), true), [
      'NumericLiteral',
    ])

    // `message` can be void
    if (isToken(p.peek(), 'symbol', ';')) {
      p.take()

      return p.finishNode(node, 'ErrorStatement', {
        status,
      })
    }

    const message = parseExpr(p)

    ensureSemi(p)

    return p.finishNode(node, 'ErrorStatement', {
      status,
      message,
    })
  }

  if (token.value === 'restart') {
    ensureSemi(p)

    return p.finishNode(node, 'RestartStatement', {})
  }

  if (token.value === 'synthetic') {
    const response = parseExpr(p)

    ensureSemi(p)

    return p.finishNode(node, 'SyntheticStatement', {
      response,
    })
  }

  if (token.value === 'log') {
    const content = parseExpr(p)

    ensureSemi(p)

    return p.finishNode(node, 'LogStatement', {
      content,
    })
  }

  if (token.value === 'if') {
    p.validateToken(p.read(), 'symbol', '(')

    const test = parseExpr(p)

    p.validateToken(p.read(), 'symbol', ')')

    p.validateToken(p.read(), 'symbol', '{')

    const consequent: Array<n.Statement> = []
    while (true) {
      if (isToken(p.peek(), 'symbol', '}')) {
        p.take()
        break
      }

      consequent.push(parseStmt(p))
    }

    if (p.isEOF() || !isToken(p.peek(), 'ident', 'else')) {
      return p.finishNode(node, 'IfStatement', {
        test,
        consequent,
      })
    }

    p.take()

    let alternative: n.IfStatement | Array<n.Statement>
    if (isToken(p.peek(), 'ident', 'if')) {
      alternative = p.validateNode(parseStmt(p), ['IfStatement'])
    } else {
      p.validateToken(p.read(), 'symbol', '{')

      alternative = []

      while (true) {
        if (isToken(p.peek(), 'symbol', '}')) {
          p.take()
          break
        }

        alternative.push(parseStmt(p))
      }
    }

    return p.finishNode(node, 'IfStatement', {
      test,
      consequent,
      alternative,
    })
  }

  if (token.value === 'sub') {
    const id = p.validateNode(parseExpr(p, p.read(), true), ['Identifier'])
    p.validateToken(p.read(), 'symbol', '{')

    const body = []

    while (true) {
      if (isToken(p.peek(), 'symbol', '}')) {
        p.take()
        break
      }

      body.push(parseStmt(p))
    }

    return p.finishNode(node, 'SubroutineStatement', {
      id,
      body,
    })
  }

  if (token.value === 'acl') {
    const id = p.validateNode(parseExpr(p, p.read(), true), ['Identifier'])
    p.validateToken(p.read(), 'symbol', '{')

    const body = []

    while (true) {
      if (isToken(p.peek()!, 'symbol', '}')) {
        p.take()
        break
      }

      body.push(parseIp(p))

      ensureSemi(p)
    }

    return p.finishNode(node, 'AclStatement', {
      id,
      body,
    })
  }

  if (token.value === 'backend') {
    const id = p.validateNode(parseExpr(p, p.read(), true), ['Identifier'])

    p.validateToken(p.read(), 'symbol', '{')

    const body = parseBackendDef(p)

    return p.finishNode(node, 'BackendStatement', {
      id,
      body,
    })
  }

  throw createError(
    p.source,
    '[stmt] not implemented yet',
    node.loc.start,
    node.loc.end
  )
}

const parseBackendDef = (p: Parser): n.BackendDef => {
  const body = []

  while (true) {
    if (isToken(p.peek()!, 'symbol', '}')) {
      p.take()
      break
    }

    p.validateToken(p.read(), 'symbol', '.')
    const key = p.validateNode(parseExpr(p), ['Identifier']).name
    p.validateToken(p.read(), 'operator', '=')

    let value

    if (isToken(p.peek()!, 'symbol', '{')) {
      p.take()
      value = parseBackendDef(p)
    } else {
      value = parseExpr(p)
      ensureSemi(p)
    }

    body.push({ key, value })
  }

  return body
}
