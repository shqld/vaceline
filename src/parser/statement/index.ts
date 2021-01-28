import {
  BackendDefinition,
  DeclareValueType,
  IfStatement,
  Location,
  ReturnActionName,
  Statement,
  TableDefinition,
  TableStatement,
} from '../../nodes'
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

export const parseStmt = (p: Parser, token: Token = p.read()): Statement => {
  const loc = p.startNode()

  if (!keywords.has(token.value)) {
    const body = parseExpr(p, token)

    ensureSemi(p)

    return p.finishNode({ type: 'ExpressionStatement', body, loc })
  }

  if (token.value === 'set' || token.value === 'add') {
    const left = p.validateNode(parseExpr(p), 'Identifier', 'Member')
    const operator = p.validateToken(p.read(), 'operator').value
    const right = parseExpr(p)

    ensureSemi(p)

    const type = token.value === 'add' ? 'AddStatement' : 'SetStatement'

    return p.finishNode({ type, left, right, operator, loc })
  }

  if (token.value === 'unset') {
    const id = p.validateNode(parseExpr(p), 'Identifier', 'Member', 'ValuePair')

    ensureSemi(p)

    return p.finishNode({ type: 'UnsetStatement', id, loc })
  }

  if (token.value === 'include') {
    const module = p.validateNode(parseExpr(p), 'StringLiteral')

    ensureSemi(p)

    return p.finishNode({ type: 'IncludeStatement', module, loc })
  }

  if (token.value === 'import') {
    const module = p.validateNode(parseExpr(p), 'Identifier')

    ensureSemi(p)

    return p.finishNode({ type: 'ImportStatement', module, loc })
  }

  if (token.value === 'call') {
    const subroutine = p.validateNode(parseExpr(p), 'Identifier')

    ensureSemi(p)

    return p.finishNode({ type: 'CallStatement', subroutine, loc })
  }

  if (token.value === 'declare') {
    p.validateToken(p.read(), 'ident', 'local')

    const id = p.validateNode(
      parseIdentifier(p, p.read()),
      'Identifier',
      'Member'
    )

    const valueType = p.validateToken(p.read(), 'ident')
      .value as DeclareValueType

    ensureSemi(p)

    return p.finishNode({ type: 'DeclareStatement', id, valueType, loc })
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

    const action = returnActionToken.value as ReturnActionName

    ensureSemi(p)

    return p.finishNode({ type: 'ReturnStatement', action, loc })
  }

  if (token.value === 'error') {
    const status = Number(p.validateToken(p.read(), 'numeric').value)

    // `message` can be void
    if (isToken(p.peek(), 'symbol', ';')) {
      p.take()

      return p.finishNode({
        type: 'ErrorStatement',
        status,
        message: undefined,
        loc,
      })
    }

    const message = parseExpr(p)

    ensureSemi(p)

    return p.finishNode({ type: 'ErrorStatement', status, message, loc })
  }

  if (token.value === 'restart') {
    ensureSemi(p)

    return p.finishNode({ type: 'RestartStatement', loc })
  }

  if (token.value === 'synthetic') {
    const response = parseExpr(p)

    ensureSemi(p)

    return p.finishNode({ type: 'SyntheticStatement', response, loc })
  }

  if (token.value === 'log') {
    const content = parseExpr(p)

    ensureSemi(p)

    return p.finishNode({ type: 'LogStatement', content, loc })
  }

  if (token.value === 'if') {
    return parseIfStatement(p, loc)
  }

  if (token.value === 'sub') {
    const id = p.validateNode(parseExpr(p, p.read(), true), 'Identifier')
    p.validateToken(p.read(), 'symbol', '{')

    const body = parseCompound(p, parseStmt, '}')

    return p.finishNode({ type: 'SubroutineStatement', id, body, loc })
  }

  if (token.value === 'acl') {
    const id = p.validateNode(parseExpr(p, p.read(), true), 'Identifier')
    p.validateToken(p.read(), 'symbol', '{')

    const body = parseCompound(p, parseIp, '}', undefined, true)

    return p.finishNode({ type: 'AclStatement', id, body, loc })
  }

  if (token.value === 'backend') {
    const id = p.validateNode(parseExpr(p, p.read(), true), 'Identifier')

    p.validateToken(p.read(), 'symbol', '{')

    const body = parseCompound(p, parseBackendDef, '}')

    return p.finishNode({ type: 'BackendStatement', id, body, loc })
  }

  if (token.value === 'table') {
    return parseTableStatement(p, loc)
  }

  throw createError(p.source, '[stmt] not implemented yet', loc.start, loc.end)
}

const parseBackendDef = (p: Parser, token = p.read()): BackendDefinition => {
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

  return p.finishNode({ type: 'BackendDefinition', key, value, loc })
}

const parseIfStatement = (p: Parser, loc: Location): IfStatement => {
  p.validateToken(p.read(), 'symbol', '(')

  const test = parseExpr(p)

  p.validateToken(p.read(), 'symbol', ')')

  p.validateToken(p.read(), 'symbol', '{')

  const consequent = parseCompound(p, parseStmt, '}')

  let alternative: IfStatement | Array<Statement> | undefined = undefined

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

  return p.finishNode({
    type: 'IfStatement',
    test,
    consequent,
    alternative,
    loc,
  })
}

const parseTableDef = (p: Parser, token: Token): TableDefinition => {
  const loc = p.startNode()

  const key = p.validateToken(token, 'string').value

  p.validateToken(p.read(), 'symbol', ':')

  const value = p.validateToken(p.read(), 'string').value

  if (isToken(p.peek(), 'symbol', ',')) {
    p.take()
  }

  return p.finishNode({ type: 'TableDefinition', key, value, loc })
}

const parseTableStatement = (p: Parser, loc: Location): TableStatement => {
  const id = p.validateNode(parseIdentifier(p, p.read()), 'Identifier')

  p.validateToken(p.read(), 'symbol', '{')

  const body = parseCompound(p, parseTableDef, '}')

  return p.finishNode({ type: 'TableStatement', id, body, loc })
}
