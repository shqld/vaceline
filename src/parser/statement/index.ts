import * as n from '../../ast-nodes'
import { isToken } from '../../utils/token'

import { parseExpr, parseIdentifier } from '../expression'
import { createError } from '../create-error'
import { Parser } from '..'
import { keywords, returnActions } from '../keywords'
import { parseIp } from './ip'
import { Token } from '../tokenizer'
import { parseCompound } from '../compound'
import { NodeWithLoc } from '../../nodes/node'

const ensureSemi = (p: Parser) => {
  p.validateToken(p.read(), 'symbol', ';')
}

export const parseStmt = (p: Parser, token: Token = p.read()): n.Statement => {
  const node = p.startNode()

  if (!keywords.has(token.value)) {
    const body = parseExpr(p, token)

    ensureSemi(p)

    return p.finishNode(node, 'ExpressionStatement', {
      body,
    })
  }

  if (token.value === 'set' || token.value === 'add') {
    const left = p.validateNode(parseExpr(p), ['Identifier', 'Member'])
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
    const id = p.validateNode(parseExpr(p), ['Identifier', 'Member'])

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

    const id = p.validateNode(parseIdentifier(p, p.read()), [
      'Identifier',
      'Member',
    ])
    const valueType = p.validateToken(p.read(), 'ident').value

    ensureSemi(p)

    return p.finishNode(node, 'DeclareStatement', {
      id,
      valueType,
    })
  }

  if (token.value === 'return') {
    let returnActionToken: Token

    // `()` can be skipped
    if (isToken(p.peek(), 'symbol', '(')) {
      p.take()

      returnActionToken = p.read()

      p.validateToken(p.read(), 'symbol', ')')
    } else {
      returnActionToken = p.read()
    }

    if (!returnActions.has(returnActionToken.value)) {
      throw createError(
        p.source,
        'return should be one of ' +
          Array.from(returnActions.values()).join(', '),
        returnActionToken.loc.start,
        returnActionToken.loc.end
      )
    }

    const action = returnActionToken.value as any

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
    return parseIfStatement(p, node)
  }

  if (token.value === 'sub') {
    const id = p.validateNode(parseExpr(p, p.read(), true), ['Identifier'])
    p.validateToken(p.read(), 'symbol', '{')

    const body = parseCompound(p, parseStmt, '}')

    return p.finishNode(node, 'SubroutineStatement', {
      id,
      body,
    })
  }

  if (token.value === 'acl') {
    const id = p.validateNode(parseExpr(p, p.read(), true), ['Identifier'])
    p.validateToken(p.read(), 'symbol', '{')

    const body = parseCompound(p, parseIp, '}')

    return p.finishNode(node, 'AclStatement', {
      id,
      body,
    })
  }

  if (token.value === 'backend') {
    const id = p.validateNode(parseExpr(p, p.read(), true), ['Identifier'])

    p.validateToken(p.read(), 'symbol', '{')

    const body = parseCompound(p, parseBackendDef, '}')

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

const parseBackendDef = (p: Parser, token = p.read()): n.BackendDef => {
  p.validateToken(token, 'symbol', '.')
  const key = p.validateNode(parseExpr(p), ['Identifier']).name
  p.validateToken(p.read(), 'operator', '=')

  let value

  if (isToken(p.peek()!, 'symbol', '{')) {
    p.take()
    value = parseCompound(p, parseBackendDef, '}')
  } else {
    value = parseExpr(p)
    ensureSemi(p)
  }

  return { key, value }
}

const parseIfStatement = (p: Parser, node: NodeWithLoc): n.IfStatement => {
  p.validateToken(p.read(), 'symbol', '(')

  const test = parseExpr(p)

  p.validateToken(p.read(), 'symbol', ')')

  p.validateToken(p.read(), 'symbol', '{')

  const consequent = parseCompound(p, parseStmt, '}')

  let alternative: n.IfStatement | Array<n.Statement> | undefined = undefined

  const next = p.peek()

  if (isToken(next, 'ident', /elsif|elseif/)) {
    p.take()
    alternative = parseIfStatement(p, p.startNode())
  } else if (isToken(next, 'ident', 'else')) {
    p.take()

    if (isToken(p.peek(), 'ident', 'if')) {
      p.take()
      alternative = parseIfStatement(p, p.startNode())
    } else {
      p.validateToken(p.read(), 'symbol', '{')
      alternative = parseCompound(p, parseStmt, '}')
    }
  }

  return p.finishNode(node, 'IfStatement', {
    test,
    consequent,
    alternative,
  })
}
