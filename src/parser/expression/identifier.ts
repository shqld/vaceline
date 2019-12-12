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
      name: token!.value,
    }
  )
): n.NodeWithLoc<n.Member | n.ValuePair | n.Identifier> => {
  // Member
  if (isToken(p.peek(), 'symbol', '.')) {
    p.take()

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

    return parseIdentifier(p, undefined, expr as n.NodeWithLoc<n.Member>)
  }

  // ValuePair
  if (isToken(p.peek(), 'symbol', ':')) {
    p.take()

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

  return base
}
