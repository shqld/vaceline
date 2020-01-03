import { Token } from './tokenizer'

export class TokenReader {
  private tokens: Array<Token>
  private cur: number

  comments: Array<Token>

  constructor(tokens: Array<Token>) {
    this.tokens = tokens
    this.comments = []

    this.cur = 0
  }

  getCurrentToken(): Token {
    return this.tokens[this.cur - 1]
  }

  jumpTo(cur: number) {
    this.cur = cur
  }

  getCursor(): number {
    return this.cur
  }

  get(cur: number): Token | null {
    return this.tokens[cur]
  }

  read(): Token {
    const token = this.tokens[this.cur++]

    if (!token) {
      throw new SyntaxError('Unexpected EOF')
    }

    if (token.type === 'comment') {
      this.comments.push(token)
      return this.read()
    }

    return token
  }

  peek(): Token | null {
    const token = this.tokens[this.cur]

    if (!token) return null

    if (token.type === 'comment') {
      this.comments.push(token)
      this.take()
      return this.peek()
    }

    return token
  }

  take(): void {
    this.cur++
  }
}
