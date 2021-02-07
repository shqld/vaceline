import { Parser } from '..'
import { Identifier, Member, Located, ValuePair } from '../../nodes'
import { Token } from '../tokenizer'
import { isToken } from '../../utils/token'

export const parseIdentifier = (
  p: Parser,
  token?: Token,
  base: Located<Identifier | Member> = p.finishNode({
    type: 'Identifier',
    name: (token ?? p.read()).value,
    loc: p.startNode(),
  })
): Located<Member | ValuePair | Identifier> => {
  if (isToken(p.peek(), 'symbol', '.')) {
    p.take()
    return parseIdentifier(p, undefined, parseMember(p, base))
  }

  if (isToken(p.peek(), 'symbol', ':')) {
    p.take()
    // return the expression here because there won't be any recursive pattern
    return parseValuePair(p, base)
  }

  return base
}

export const parseMember = (
  p: Parser,
  base: Located<Identifier | Member>
): Located<Member> => {
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

export const parseValuePair = (
  p: Parser,
  base: Located<Identifier | Member>
): Located<ValuePair> => {
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
