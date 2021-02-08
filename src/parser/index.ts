import { Tokenizer, Token, TokenType } from './tokenizer'
import {
  Node,
  Located,
  NodeType,
  Statement,
  Program,
  Position,
  Comment,
} from '../nodes'
import { createError } from './create-error'
import { TokenReader } from './token-reader'

import { isToken } from '../utils/token'
import { parseStmt } from './statement/index'
import { parseCompound } from './compound'
import { buildDebug } from '../utils/debug'

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

export class Parser extends TokenReader {
  source: string

  constructor(source: string /* opts: { keywords?: Array<string> } = {} */) {
    const tokens = new Tokenizer(source).tokenize()

    super(tokens)

    this.source = source
  }

  parse(): Located<Program> {
    const body = parseCompound<Statement>(this, parseStmt)

    const pos = { offset: 0, line: 1, column: 1 }

    const node: Located<Program> = {
      type: 'Program',
      body,
      loc: {
        start: pos,
        end: this.getCurrentToken().loc.end,
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
        end: this.getCurrentToken().loc.end,
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

    let i = this.comments.length - 1

    while (this.comments[i]?.loc?.start.line ?? Infinity < pos.line) {
      leadingComments?.push(this.comments[i])
      i--
    }

    this.comments = this.comments.slice(0, i)

    return leadingComments.reverse()
  }

  parseInnerComments(): Array<Comment> {
    const innerComments = this.comments.slice()

    this.comments = []

    return innerComments
  }

  parseTrailingComments(): Array<Comment> {
    const trailingComments: Array<Comment> = []

    let cur = this.getCursor()
    let token = this.getToken(cur)

    while (
      token?.type === 'comment' &&
      token.loc.start.line === this.getCurrentToken().loc.end.line
    ) {
      this.take()

      trailingComments.push({
        type: 'CommentLine',
        value: token.value,
        loc: token.loc,
      })

      token = this.getToken(++cur)
    }

    return trailingComments
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
