import { Parser } from '..'
import { Identifier, Member, Located, ValuePair } from '../../nodes'
import { Token } from '../tokenizer'
import { isToken } from '../../utils/token'

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

function parseIdentifier(
  p: Parser,
  token: Token = p.read()
): Located<Identifier> {
  return p.finishNode({
    type: 'Identifier',
    name: token.value,
    loc: p.startNode(),
  })
}

function parseMember(
  p: Parser,
  base: Located<Exclude<Id, ValuePair>>
): Located<Member> {
  const memberTok = p.read()
  const member = p.finishNode({
    type: 'Identifier',
    name: memberTok.value,
    loc: p.startNode(),
  })

  return {
    type: 'Member',
    base,
    member,
    loc: {
      start: base.loc.start,
      end: member.loc.end,
    },
  }
}

function parseValuePair(
  p: Parser,
  base: Located<Exclude<Id, ValuePair>>
): Located<ValuePair> {
  const nameTok = p.read()
  const name = p.finishNode({
    type: 'Identifier',
    name: nameTok.value,
    loc: p.startNode(),
  })

  return {
    type: 'ValuePair',
    base,
    name,
    loc: {
      start: base.loc.start,
      end: name.loc.end,
    },
  }
}
