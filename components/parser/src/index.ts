import { Tokenizer, Token, TokenType, isToken } from './tokenizer'
import {
  Node,
  Located,
  NodeType,
  Statement,
  Program,
  Position,
  Comment,
} from '@vaceline/types'
import { createError } from './create-error'
import { TokenReader } from './token-reader'

import { buildDebug } from '@vaceline/utils'
import { parseStmt } from './statement/index'
import { parseCompound } from './compound'

const debug = {
  start: buildDebug('parser:start'),
  finish: buildDebug('parser:finish'),
  trace: buildDebug('parser:trace'),
}

export const parse = (source: string): Program => new Parser(source).parse()

interface ParsingState {
  token: Token
  pos: Position
  comments?: Array<Comment>
}

export class Parser {
  source: string
  private reader: TokenReader

  constructor(source: string /* opts: { keywords?: Array<string> } = {} */) {
    const tokens = new Tokenizer(source).tokenize()

    this.source = source
    this.reader = new TokenReader(tokens)
  }

  parse(): Located<Program> {
    const body = parseCompound<Statement>(this, parseStmt)

    const pos = { offset: 0, line: 1, column: 1 }

    const node: Located<Program> = {
      type: 'Program',
      body,
      loc: {
        start: pos,
        end: this.reader.getCurrentToken().loc.end,
      },
    }

    node.leadingComments = []
    node.innerComments = this.parseInnerComments()
    node.trailingComments = this.parseTrailingComments()

    return node
  }

  parseNode<T extends NodeType>(
    token: Token,
    parse: (state: ParsingState) => Node & { type: T }
  ): Located<Node & { type: T }> {
    debug.start(token)

    const state: ParsingState = {
      token,
      pos: token.loc.start,
    }

    const leadingComments = this.parseLeadingComments(state.pos)

    const node = parse(state)

    if (!node.loc) {
      node.loc = {
        start: state.pos,
        end: this.reader.getCurrentToken().loc.end,
      }
    }

    node.leadingComments = leadingComments
    node.innerComments = this.parseInnerComments()
    node.trailingComments = this.parseTrailingComments()

    debug.finish(node)

    // @ts-expect-error FIXME:
    return node
  }

  parseLeadingComments(pos: Position): Array<Comment> {
    const leadingComments = []

    let i = this.reader.comments.length - 1

    while (this.reader.comments[i]?.loc?.start.line ?? Infinity < pos.line) {
      leadingComments?.push(this.reader.comments[i])
      i--
    }

    this.reader.comments = this.reader.comments.slice(0, i + 1)

    return leadingComments.reverse()
  }

  parseInnerComments(): Array<Comment> {
    const innerComments = this.reader.comments.slice()

    this.reader.comments = []

    return innerComments
  }

  parseTrailingComments(): Array<Comment> {
    const trailingComments: Array<Comment> = []

    let cur = this.reader.getCursor()
    let token = this.reader.getToken(cur)

    while (
      token?.type === 'comment' &&
      token.loc.start.line === this.reader.getCurrentToken().loc.end.line
    ) {
      this.reader.jumpTo(cur + 1)

      trailingComments.push({
        type: 'CommentLine',
        value: token.value,
        loc: token.loc,
      })

      token = this.reader.getToken(++cur)
    }

    return trailingComments
  }

  read() {
    return this.reader.read()
  }
  peek() {
    return this.reader.peek()
  }
  take() {
    return this.reader.take()
  }
  getCursor() {
    return this.reader.getCursor()
  }
  jumpTo(cur: number) {
    return this.reader.jumpTo(cur)
  }
  getCurrentToken(): Token {
    return this.reader.getCurrentToken()
  }

  validateNode<T extends Array<NodeType>>(
    node: Located<Node>,
    ...types: T
  ): Located<Node & { type: T[number] }> {
    if (!types.includes(node.type)) {
      throw createError(
        this.source,
        'Expected one of [' + types.join(', ') + ']',
        node.loc.start,
        node.loc.end
      )
    }

    return node as Located<Node & { type: T }>
  }

  validateToken<T extends TokenType, U extends string>(
    token: Token,
    type: T,
    value?: U
  ): Token & { type: T; value: U } {
    if (!isToken(token, type, value)) {
      throw createError(
        this.source,
        `Expected '${value}' ${type} token`,
        token.loc.start,
        token.loc.end
      )
    }

    return token as Token & { type: T; value: U }
  }
}
