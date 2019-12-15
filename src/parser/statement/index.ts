import * as n from '../../nodes'
import { NodeWithLoc } from '../../nodes'
import { isToken } from '../../utils/token'

import { parseExpr } from '../expression'
import { createError } from '../create-error'
import { Parser } from '..'
import { keywords, returnActions } from '../keywords'
import { parseIp } from './ip'
import { Token } from '../tokenizer'
import { parseCompound } from '../compound'
import { parseIdentifier } from '../expression/identifier'

const ensureSemi = (p: Parser) => {
  p.validateToken(p.read(), 'symbol', ';')
}

export const parseStmt = (p: Parser, token: Token = p.read()): n.Statement => {
  const node = p.startNode()

  if (!keywords.has(token.value)) {
    const body = parseExpr(p, token)

    ensureSemi(p)

    return p.finishNode(n.ExpressionStatement, node, {
      body,
    })
  }

  if (token.value === 'set' || token.value === 'add') {
    const left = p.validateNode(parseExpr(p), ['Identifier', 'Member'])
    const operator = p.validateToken(p.read(), 'operator').value
    const right = parseExpr(p)

    ensureSemi(p)

    const type: Class<n.Node> =
      token.value === 'add' ? n.AddStatement : n.SetStatement

    return p.finishNode(type, node, {
      left,
      operator,
      right,
    }) as n.AddStatement | n.SetStatement
  }

  if (token.value === 'unset') {
    const id = p.validateNode(parseExpr(p), ['Identifier', 'Member'])

    ensureSemi(p)

    return p.finishNode(n.UnsetStatement, node, {
      id,
    })
  }

  if (token.value === 'include') {
    const module = p.validateNode(parseExpr(p), ['StringLiteral'])

    ensureSemi(p)

    return p.finishNode(n.IncludeStatement, node, {
      module,
    })
  }

  if (token.value === 'import') {
    const module = p.validateNode(
      parseExpr(p),
      ['Identifier'],
      'Only identifier is valid for import'
    )

    ensureSemi(p)

    return p.finishNode(n.ImportStatement, node, {
      module,
    })
  }

  if (token.value === 'call') {
    const subroutine = p.validateNode(parseExpr(p), ['Identifier'])

    ensureSemi(p)

    return p.finishNode(n.CallStatement, node, {
      subroutine,
    })
  }

  if (token.value === 'declare') {
    p.validateToken(p.read(), 'ident', 'local')

    const id = p.validateNode(parseIdentifier(p, p.read()), [
      'Identifier',
      'Member',
    ])

    const valueType = p.validateToken(p.read(), 'ident')
      .value as n.DeclareValueType

    ensureSemi(p)

    return p.finishNode(n.DeclareStatement, node, {
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
        'return action should be one of ' +
          Array.from(returnActions.values()).join(', '),
        returnActionToken.loc.start,
        returnActionToken.loc.end
      )
    }

    const action = returnActionToken.value as n.ReturnActionName

    ensureSemi(p)

    return p.finishNode(n.ReturnStatement, node, { action })
  }

  if (token.value === 'error') {
    const status = Number(p.validateToken(p.read(), 'numeric').value)

    // `message` can be void
    if (isToken(p.peek(), 'symbol', ';')) {
      p.take()

      return p.finishNode(n.ErrorStatement, node, {
        status,
      })
    }

    const message = parseExpr(p)

    ensureSemi(p)

    return p.finishNode(n.ErrorStatement, node, {
      status,
      message,
    })
  }

  if (token.value === 'restart') {
    ensureSemi(p)

    return p.finishNode(n.RestartStatement, node, {})
  }

  if (token.value === 'synthetic') {
    const response = parseExpr(p)

    ensureSemi(p)

    return p.finishNode(n.SyntheticStatement, node, {
      response,
    })
  }

  if (token.value === 'log') {
    const content = parseExpr(p)

    ensureSemi(p)

    return p.finishNode(n.LogStatement, node, {
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

    return p.finishNode(n.SubroutineStatement, node, {
      id,
      body,
    })
  }

  if (token.value === 'acl') {
    const id = p.validateNode(parseExpr(p, p.read(), true), ['Identifier'])
    p.validateToken(p.read(), 'symbol', '{')

    const body = parseCompound(p, parseIp, '}', undefined, true)

    return p.finishNode(n.AclStatement, node, {
      id,
      body,
    })
  }

  if (token.value === 'backend') {
    const id = p.validateNode(parseExpr(p, p.read(), true), ['Identifier'])

    p.validateToken(p.read(), 'symbol', '{')

    const body = parseCompound(p, parseBackendDef, '}')

    return p.finishNode(n.BackendStatement, node, {
      id,
      body,
    })
  }

  if (token.value === 'table') {
    return parseTableStatement(p, node)
  }

  throw createError(
    p.source,
    '[stmt] not implemented yet',
    node.loc.start,
    node.loc.end
  )
}

const parseBackendDef = (p: Parser, token = p.read()): n.BackendDefinition => {
  const node = p.startNode()
  p.validateToken(token, 'symbol', '.')
  const key = p.validateNode(parseExpr(p), ['Identifier']).name
  p.validateToken(p.read(), 'operator', '=')

  let value

  if (isToken(p.peek(), 'symbol', '{')) {
    p.take()
    value = parseCompound(p, parseBackendDef, '}')
  } else {
    value = parseExpr(p)
    ensureSemi(p)
  }

  return p.finishNode(n.BackendDefinition, node, { key, value })
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

  return p.finishNode(n.IfStatement, node, {
    test,
    consequent,
    alternative,
  })
}

const parseTableDef = (p: Parser, token: Token): n.TableDefinition => {
  const node = p.startNode()

  const key = p.validateToken(token, 'string').value

  p.validateToken(p.read(), 'symbol', ':')

  const value = p.validateToken(p.read(), 'string').value

  if (isToken(p.peek(), 'symbol', ',')) {
    p.take()
  }

  return p.finishNode(n.TableDefinition, node, {
    key,
    value,
  })
}

const parseTableStatement = (
  p: Parser,
  node: NodeWithLoc
): n.TableStatement => {
  const id = p.validateNode(parseIdentifier(p, p.read()), ['Identifier'])

  p.validateToken(p.read(), 'symbol', '{')

  const body = parseCompound(p, parseTableDef, '}')

  return p.finishNode(n.TableStatement, node, {
    id,
    body,
  })
}
