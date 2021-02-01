import { Tokenizer, Token, TokenType } from './tokenizer'
import {
  Node,
  NodeWithLoc,
  Location,
  NodeType,
  Statement,
  Program,
} from '../nodes'
import { createError } from './create-error'
import { TokenReader } from './token-reader'

import { isToken } from '../utils/token'
import { parseStmt } from './statement/index'
import { parseCompound } from './compound'
import { buildDebug } from '../utils/debug'

const debug = buildDebug('parser')

export const parse = (source: string): Program => new Parser(source).parse()

export class Parser extends TokenReader {
  source: string

  constructor(source: string /* opts: { keywords?: Array<string> } = {} */) {
    const tokens = new Tokenizer(source).tokenize()

    super(tokens)

    this.source = source
  }

  parse(): Program {
    const loc = this.startNode()

    const body = parseCompound<Statement>(this, parseStmt)

    // TODO: overload builder func type,
    // to detect we pass `loc` and its return type is surely `NodeWithLoc`
    return this.finishNode({ type: 'Program', body, loc })
  }

  startNode(): Location {
    const startToken = this.getCurrentToken()
    const start = startToken
      ? startToken.loc.start
      : { offset: 0, line: 1, column: 1 }

    return {
      start,
      end: {
        offset: NaN,
        line: NaN,
        column: NaN,
      },
    }
  }

  finishNode<T extends NodeType>(
    node: NodeWithLoc<Node & { type: T }>
  ): NodeWithLoc<Node & { type: T }> {
    node.loc.end = this.getCurrentToken().loc.end

    if (debug.enabled) {
      const log = { ...node }
      // @ts-expect-error
      delete log.loc
      debug(log)
    }

    return node
  }

  validateNode<T extends Array<NodeType>>(
    node: NodeWithLoc,
    ...types: T
  ): NodeWithLoc<Node & { type: T[number] }> {
    if (!types.includes(node.type)) {
      throw createError(
        this.source,
        'Expected one of [' + types.join(', ') + ']',
        node.loc.start,
        node.loc.end
      )
    }

    return node as NodeWithLoc<Node & { type: T }>
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
