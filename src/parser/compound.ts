import { Parser } from '.'
import { Token } from './tokenizer'
import { isToken } from '../utils/token'

export const parseCompound = <T>(
  p: Parser,
  parse: (p: Parser, token: Token) => T,
  until?: string,
  delimiter?: string,
  semi = false
): Array<T> => {
  const compound: Array<T> = []

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const token = p.peek()

    if (!token) {
      break
    }

    p.take()

    if (until && token.type === 'symbol' && token.value === until) {
      // zero length arg or trailing comma
      break
    }

    const node = parse(p, token)

    compound.push(node)

    if (delimiter) {
      if (isToken(p.peek(), 'symbol', delimiter)) {
        p.take()

        continue
      }

      if (until) p.validateToken(p.read(), 'symbol', until)

      break
    }

    if (semi) p.validateToken(p.read(), 'symbol', ';')

    if (until && isToken(p.peek(), 'symbol', until)) {
      p.take()
      break
    }
  }

  return compound
}
