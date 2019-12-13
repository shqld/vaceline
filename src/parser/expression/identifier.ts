import { Parser } from '..'
import * as n from '../../nodes'
import { Token } from '../tokenizer'
import { isToken } from '../../utils/token'

export const parseIdentifier = (
  p: Parser,
  token?: Token,
  base: n.NodeWithLoc<n.Identifier | n.Member> = p.finishNode(
    n.Identifier,
    p.startNode(),
    {
      name: (token ?? p.read()).value,
    }
  )
): n.NodeWithLoc<n.Member | n.ValuePair | n.Identifier> => {
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
  base: n.NodeWithLoc<n.Identifier | n.Member>
): n.NodeWithLoc<n.Member> => {
  const memberTok = p.read()
  const member = p.finishNode(n.Identifier, p.startNode(), {
    name: memberTok.value,
  })

  const expr = new n.Member({
    base,
    member,
  })

  expr.loc = {
    start: base.loc.start,
    end: member.loc.end,
  }

  return expr as n.NodeWithLoc<n.Member>
}

export const parseValuePair = (
  p: Parser,
  base: n.NodeWithLoc<n.Identifier | n.Member>
): n.NodeWithLoc<n.ValuePair> => {
  const nameTok = p.read()
  const name = p.finishNode(n.Identifier, p.startNode(), {
    name: nameTok.value,
  })

  const expr = new n.ValuePair({
    base,
    name,
  })

  expr.loc = {
    start: base.loc.start,
    end: name.loc.end,
  }

  return expr as n.NodeWithLoc<n.ValuePair>
}
