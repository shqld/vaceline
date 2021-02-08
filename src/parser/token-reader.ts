import { Comment } from '../nodes'
import { Token } from './tokenizer'

export class TokenReader {
  private tokens: Array<Token>
  private cur: number

  comments: Array<Comment>

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

  getToken(cur: number): Token | null {
    return this.tokens[cur]
  }

  read(): Token {
    const token = this.tokens[this.cur++]

    if (!token) {
      throw new SyntaxError('Unexpected EOF')
    }

    if (token.type === 'comment') {
      this.comments.push({
        type: 'CommentLine',
        value: token.value,
        loc: token.loc,
      })
      return this.read()
    }

    return token
  }

  peek(): Token | undefined {
    const token = this.tokens[this.cur]

    if (!token) return undefined

    if (token.type === 'comment') {
      this.comments.push({
        type: 'CommentLine',
        value: token.value,
        loc: token.loc,
      })
      this.take()
      return this.peek()
    }

    return token
  }

  take(): void {
    this.cur++
  }
}
