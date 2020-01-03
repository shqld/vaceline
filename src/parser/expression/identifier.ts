import { Parser } from '..'
import { d, b, NodeWithLoc } from '../../nodes'
import { Token } from '../tokenizer'
import { isToken } from '../../utils/token'

export const parseIdentifier = (
  p: Parser,
  token?: Token,
  base: NodeWithLoc<d.Identifier | d.Member> = p.finishNode(
    b.buildIdentifier((token ?? p.read()).value, p.startNode())
  )
): NodeWithLoc<d.Member | d.ValuePair | d.Identifier> => {
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
  base: NodeWithLoc<d.Identifier | d.Member>
): NodeWithLoc<d.Member> => {
  const memberTok = p.read()
  const member = p.finishNode(b.buildIdentifier(memberTok.value, p.startNode()))

  return b.buildMember(base, member, {
    start: base.loc.start,
    end: member.loc.end,
  })
}

export const parseValuePair = (
  p: Parser,
  base: NodeWithLoc<d.Identifier | d.Member>
): NodeWithLoc<d.ValuePair> => {
  const nameTok = p.read()
  const name = p.finishNode(b.buildIdentifier(nameTok.value, p.startNode()))

  return b.buildValuePair(base, name, {
    start: base.loc.start,
    end: name.loc.end,
  })
}
