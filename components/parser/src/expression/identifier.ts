import { Parser } from '..'
import { Identifier, Member, Located, ValuePair } from '@vaceline/types'
import { isToken, Token } from '../tokenizer'
import { createError } from '../create-error'

type Id = Member | ValuePair | Identifier

export function parseId(
  p: Parser,
  token?: Token,
  base: Located<Exclude<Id, ValuePair>> = parseIdentifier(p, token)
): Located<Id> {
  if (isToken(p.peek(), 'symbol', '.')) {
    p.take()
    return parseId(p, undefined, parseMember(p, base))
  }

  if (isToken(p.peek(), 'symbol', ':')) {
    p.take()
    // return the expression here because there won't be any recursive pattern
    return parseValuePair(p, base)
  }

  return base
}

export function parseIdentifier(
  p: Parser,
  token: Token = p.read()
): Located<Identifier> {
  return p.parseNode(token, () => {
    if (token.type !== 'ident') {
      throw createError(
        p.source,
        'Expected one of [Identifier]',
        token.loc.start,
        token.loc.end
      )
    }

    return {
      type: 'Identifier',
      name: token.value,
    }
  })
}

function parseMember(
  p: Parser,
  base: Located<Exclude<Id, ValuePair>>
): Located<Member> {
  return p.parseNode(p.read(), ({ token }) => {
    const member = p.parseNode(token, () => ({
      type: 'Identifier',
      name: token.value,
    }))

    return {
      type: 'Member',
      base,
      member,
      loc: {
        start: base.loc.start,
        end: member.loc.end,
      },
    }
  })
}

function parseValuePair(
  p: Parser,
  base: Located<Exclude<Id, ValuePair>>
): Located<ValuePair> {
  return p.parseNode(p.read(), ({ token }) => {
    const name = p.parseNode(token, () => ({
      type: 'Identifier',
      name: token.value,
    }))

    return {
      type: 'ValuePair',
      base,
      name,
      loc: {
        start: base.loc.start,
        end: name.loc.end,
      },
    }
  })
}
