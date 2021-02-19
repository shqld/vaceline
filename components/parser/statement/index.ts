import {
  BackendDefinition,
  DeclareValueType,
  DirectorStatement,
  IfStatement,
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
import { parseId, parseIdentifier } from '../expression/identifier'
import { parseLiteral } from '../literal'

const ensureSemi = (p: Parser) => p.validateToken(p.read(), 'symbol', ';')

export function parseStmt(p: Parser, token: Token = p.read()): Statement {
  if (!keywords.has(token.value)) {
    return p.parseNode(token, () => {
      const body = parseExpr(p, token)

      ensureSemi(p)

      return { type: 'ExpressionStatement', body }
    })
  }

  if (token.value === 'set' || token.value === 'add') {
    return p.parseNode(token, () => {
      const left = parseId(p)
      const operator = p.validateToken(p.read(), 'operator').value
      const right = parseExpr(p)

      ensureSemi(p)

      const type = token.value === 'add' ? 'AddStatement' : 'SetStatement'

      return { type, left, right, operator }
    })
  }

  if (token.value === 'unset') {
    return p.parseNode(token, () => {
      const id = parseId(p)

      ensureSemi(p)

      return { type: 'UnsetStatement', id }
    })
  }

  if (token.value === 'include') {
    return p.parseNode(token, () => {
      const moduleToken = p.read()
      const module = parseLiteral(p, moduleToken)

      if (!(module && module.type === 'StringLiteral')) {
        throw createError(
          p.source,
          'Expected one of [StringLiteral]',
          moduleToken.loc.start,
          moduleToken.loc.end
        )
      }

      ensureSemi(p)

      return {
        type: 'IncludeStatement',
        module: p.validateNode(module, 'StringLiteral'),
      }
    })
  }

  if (token.value === 'import') {
    return p.parseNode(token, () => {
      const module = parseIdentifier(p)

      ensureSemi(p)

      return { type: 'ImportStatement', module }
    })
  }

  if (token.value === 'call') {
    return p.parseNode(token, () => {
      const subroutine = parseIdentifier(p)

      ensureSemi(p)

      return { type: 'CallStatement', subroutine }
    })
  }

  if (token.value === 'declare') {
    return p.parseNode(token, () => {
      p.validateToken(p.read(), 'ident', 'local')

      const id = p.validateNode(parseId(p, p.read()), 'Identifier', 'Member')

      const valueType = p.validateToken(p.read(), 'ident')
        .value as DeclareValueType

      ensureSemi(p)

      return { type: 'DeclareStatement', id, valueType }
    })
  }

  if (token.value === 'return') {
    return p.parseNode(token, () => {
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

      return { type: 'ReturnStatement', action }
    })
  }

  if (token.value === 'error') {
    return p.parseNode(token, () => {
      const status = Number(p.validateToken(p.read(), 'numeric').value)

      // `message` can be void
      if (isToken(p.peek(), 'symbol', ';')) {
        p.take()

        return {
          type: 'ErrorStatement',
          status,
          message: undefined,
        }
      }

      const message = parseExpr(p)

      ensureSemi(p)

      return { type: 'ErrorStatement', status, message }
    })
  }

  if (token.value === 'restart') {
    return p.parseNode(token, () => {
      ensureSemi(p)

      return { type: 'RestartStatement' }
    })
  }

  if (token.value === 'synthetic') {
    return p.parseNode(token, () => {
      const response = parseExpr(p)

      ensureSemi(p)

      return { type: 'SyntheticStatement', response }
    })
  }

  if (token.value === 'log') {
    return p.parseNode(token, () => {
      const content = parseExpr(p)

      ensureSemi(p)

      return { type: 'LogStatement', content }
    })
  }

  if (token.value === 'if') {
    return parseIfStatement(p, token)
  }

  if (token.value === 'sub') {
    return p.parseNode(token, () => {
      const id = parseIdentifier(p)
      p.validateToken(p.read(), 'symbol', '{')

      const body = parseCompound(p, parseStmt, { until: '}' })

      return { type: 'SubroutineStatement', id, body }
    })
  }

  if (token.value === 'acl') {
    return p.parseNode(token, () => {
      const id = parseIdentifier(p)

      p.validateToken(p.read(), 'symbol', '{')

      const body = parseCompound(p, parseIp, { until: '}', semi: true })

      return { type: 'AclStatement', id, body }
    })
  }

  if (token.value === 'backend') {
    return p.parseNode(token, () => {
      const id = parseIdentifier(p)

      p.validateToken(p.read(), 'symbol', '{')

      const body = parseCompound(p, parseBackendDef, { until: '}' })

      return { type: 'BackendStatement', id, body }
    })
  }

  if (token.value === 'table') {
    return parseTableStatement(p, token)
  }

  if (token.value === 'director') {
    return parseDirectorStatement(p, token)
  }

  throw createError(
    p.source,
    'Statement not implemented yet',
    token.loc.start,
    token.loc.end
  )
}

function parseBackendDef(p: Parser, token = p.read()): BackendDefinition {
  return p.parseNode(token, () => {
    p.validateToken(token, 'symbol', '.')
    const key = p.validateNode(parseExpr(p), 'Identifier').name
    p.validateToken(p.read(), 'operator', '=')

    let value

    if (isToken(p.peek(), 'symbol', '{')) {
      p.take()
      value = parseCompound(p, parseBackendDef, { until: '}' })
    } else {
      value = parseExpr(p)
      ensureSemi(p)
    }

    return { type: 'BackendDefinition', key, value }
  })
}

function parseIfStatement(p: Parser, token: Token = p.read()): IfStatement {
  return p.parseNode(token, () => {
    p.validateToken(p.read(), 'symbol', '(')

    const test = parseExpr(p)

    p.validateToken(p.read(), 'symbol', ')')

    p.validateToken(p.read(), 'symbol', '{')

    const consequent = parseCompound(p, parseStmt, { until: '}' })

    let alternative: IfStatement | Array<Statement> | undefined = undefined

    const next = p.peek()

    if (isToken(next, 'ident', /elsif|elseif/)) {
      alternative = parseIfStatement(p, p.read())
    } else if (isToken(next, 'ident', 'else')) {
      p.take()

      if (isToken(p.peek(), 'ident', 'if')) {
        alternative = parseIfStatement(p, p.read())
      } else {
        p.validateToken(p.read(), 'symbol', '{')
        alternative = parseCompound(p, parseStmt, { until: '}' })
      }
    }

    return {
      type: 'IfStatement',
      test,
      consequent,
      alternative,
    }
  })
}

function parseTableDef(p: Parser, token: Token = p.read()): TableDefinition {
  return p.parseNode(token, () => {
    const key = p.validateToken(token, 'string').value

    p.validateToken(p.read(), 'symbol', ':')

    const value = p.validateToken(p.read(), 'string').value

    if (isToken(p.peek(), 'symbol', ',')) {
      p.take()
    }

    return { type: 'TableDefinition', key, value }
  })
}

function parseTableStatement(
  p: Parser,
  token: Token = p.read()
): TableStatement {
  return p.parseNode(token, () => {
    const id = p.validateNode(parseId(p, p.read()), 'Identifier')

    p.validateToken(p.read(), 'symbol', '{')

    const body = parseCompound(p, parseTableDef, { until: '}' })

    return { type: 'TableStatement', id, body }
  })
}

function parseDirectorStatement(
  p: Parser,
  token: Token = p.read()
): DirectorStatement {
  return p.parseNode(token, () => {
    const id = p.validateNode(parseId(p), 'Identifier')
    const directorType = p.validateNode(parseId(p), 'Identifier')

    p.validateToken(p.read(), 'symbol', '{')

    const body = parseCompound(
      p,
      (p, token) => {
        if (token.value === '{') {
          const attributes = parseCompound(
            p,
            (p, token) => {
              p.validateToken(token, 'symbol', '.')
              const key = p.read().value
              p.validateToken(p.read(), 'operator', '=')
              const value = p.read().value
              ensureSemi(p)

              return { key, value }
            },
            { until: '}' }
          )

          const backend = attributes.shift()
          if (backend?.key !== 'backend')
            // TODO: use general-purpose validate function
            throw new Error('No backend name specified')

          return {
            backend: backend.value,
            attributes,
          }
        }

        p.validateToken(token, 'symbol', '.')
        const key = p.read().value
        p.validateToken(p.read(), 'operator', '=')
        const value = p.read().value
        ensureSemi(p)

        return { key, value }
      },
      { until: '}' }
    ).filter(Boolean)

    return {
      type: 'DirectorStatement',
      id,
      directorType,
      body,
    }
  })
}
