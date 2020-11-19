import { d, b, Location } from '../../nodes'
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

export const parseStmt = (p: Parser, token: Token = p.read()): d.Statement => {
  const loc = p.startNode()

  if (!keywords.has(token.value)) {
    const body = parseExpr(p, token)

    ensureSemi(p)

    return p.finishNode(b.buildExpressionStatement(body, loc))
  }

  if (token.value === 'set' || token.value === 'add') {
    const left = p.validateNode(parseExpr(p), 'Identifier', 'Member')
    const operator = p.validateToken(p.read(), 'operator').value
    const right = parseExpr(p)

    ensureSemi(p)

    const builder =
      token.value === 'add' ? b.buildAddStatement : b.buildSetStatement

    return p.finishNode(builder(left, right, operator, loc))
  }

  if (token.value === 'unset') {
    const id = p.validateNode(parseExpr(p), 'Identifier', 'Member', 'ValuePair')

    ensureSemi(p)

    return p.finishNode(b.buildUnsetStatement(id, loc))
  }

  if (token.value === 'include') {
    const module = p.validateNode(parseExpr(p), 'StringLiteral')

    ensureSemi(p)

    return p.finishNode(b.buildIncludeStatement(module, loc))
  }

  if (token.value === 'import') {
    const module = p.validateNode(parseExpr(p), 'Identifier')

    ensureSemi(p)

    return p.finishNode(b.buildImportStatement(module, loc))
  }

  if (token.value === 'call') {
    const subroutine = p.validateNode(parseExpr(p), 'Identifier')

    ensureSemi(p)

    return p.finishNode(b.buildCallStatement(subroutine, loc))
  }

  if (token.value === 'declare') {
    p.validateToken(p.read(), 'ident', 'local')

    const id = p.validateNode(
      parseIdentifier(p, p.read()),
      'Identifier',
      'Member'
    )

    const valueType = p.validateToken(p.read(), 'ident')
      .value as d.DeclareValueType

    ensureSemi(p)

    return p.finishNode(b.buildDeclareStatement(id, valueType, loc))
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

    const action = returnActionToken.value as d.ReturnActionName

    ensureSemi(p)

    return p.finishNode(b.buildReturnStatement(action, loc))
  }

  if (token.value === 'error') {
    const status = Number(p.validateToken(p.read(), 'numeric').value)

    // `message` can be void
    if (isToken(p.peek(), 'symbol', ';')) {
      p.take()

      return p.finishNode(b.buildErrorStatement(status, undefined, loc))
    }

    const message = parseExpr(p)

    ensureSemi(p)

    return p.finishNode(b.buildErrorStatement(status, message, loc))
  }

  if (token.value === 'restart') {
    ensureSemi(p)

    return p.finishNode(b.buildRestartStatement(loc))
  }

  if (token.value === 'synthetic') {
    const response = parseExpr(p)

    ensureSemi(p)

    return p.finishNode(b.buildSyntheticStatement(response, loc))
  }

  if (token.value === 'log') {
    const content = parseExpr(p)

    ensureSemi(p)

    return p.finishNode(b.buildLogStatement(content, loc))
  }

  if (token.value === 'if') {
    return parseIfStatement(p, loc)
  }

  if (token.value === 'sub') {
    const id = p.validateNode(parseExpr(p, p.read(), true), 'Identifier')
    p.validateToken(p.read(), 'symbol', '{')

    const body = parseCompound(p, parseStmt, '}')

    return p.finishNode(b.buildSubroutineStatement(id, body, loc))
  }

  if (token.value === 'acl') {
    const id = p.validateNode(parseExpr(p, p.read(), true), 'Identifier')
    p.validateToken(p.read(), 'symbol', '{')

    const body = parseCompound(p, parseIp, '}', undefined, true)

    return p.finishNode(b.buildAclStatement(id, body, loc))
  }

  if (token.value === 'backend') {
    const id = p.validateNode(parseExpr(p, p.read(), true), 'Identifier')

    p.validateToken(p.read(), 'symbol', '{')

    const body = parseCompound(p, parseBackendDef, '}')

    return p.finishNode(b.buildBackendStatement(id, body, loc))
  }

  if (token.value === 'table') {
    return parseTableStatement(p, loc)
  }

  throw createError(p.source, '[stmt] not implemented yet', loc.start, loc.end)
}

const parseBackendDef = (p: Parser, token = p.read()): d.BackendDefinition => {
  const loc = p.startNode()

  p.validateToken(token, 'symbol', '.')
  const key = p.validateNode(parseExpr(p), 'Identifier').name
  p.validateToken(p.read(), 'operator', '=')

  let value

  if (isToken(p.peek(), 'symbol', '{')) {
    p.take()
    value = parseCompound(p, parseBackendDef, '}')
  } else {
    value = parseExpr(p)
    ensureSemi(p)
  }

  return p.finishNode(b.buildBackendDefinition(key, value, loc))
}

const parseIfStatement = (p: Parser, loc: Location): d.IfStatement => {
  p.validateToken(p.read(), 'symbol', '(')

  const test = parseExpr(p)

  p.validateToken(p.read(), 'symbol', ')')

  p.validateToken(p.read(), 'symbol', '{')

  const consequent = parseCompound(p, parseStmt, '}')

  let alternative: d.IfStatement | Array<d.Statement> | undefined = undefined

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

  return p.finishNode(b.buildIfStatement(test, consequent, alternative, loc))
}

const parseTableDef = (p: Parser, token: Token): d.TableDefinition => {
  const loc = p.startNode()

  const key = p.validateToken(token, 'string').value

  p.validateToken(p.read(), 'symbol', ':')

  const value = p.validateToken(p.read(), 'string').value

  if (isToken(p.peek(), 'symbol', ',')) {
    p.take()
  }

  return p.finishNode(b.buildTableDefinition(key, value, loc))
}

const parseTableStatement = (p: Parser, loc: Location): d.TableStatement => {
  const id = p.validateNode(parseIdentifier(p, p.read()), 'Identifier')

  p.validateToken(p.read(), 'symbol', '{')

  const body = parseCompound(p, parseTableDef, '}')

  return p.finishNode(b.buildTableStatement(id, body, loc))
}
