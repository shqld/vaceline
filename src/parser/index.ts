import { Tokenizer, Token, TokenType } from './tokenizer'
import { d, Nodes, NodeWithLoc, Location, NodeType } from '../nodes'
import { createError } from './create-error'
import { TokenReader } from './token-reader'

import { isToken } from '../utils/token'
import { parseStmt } from './statement/index'
import { parseCompound } from './compound'
import { buildDebug } from '../utils/debug'
import { buildProgram } from '../nodes/builders.gen'

const debug = buildDebug('parser')

export const parse = (source: string): d.Program => new Parser(source).parse()

export class Parser extends TokenReader {
  source: string

  constructor(source: string /* opts: { keywords?: Array<string> } = {} */) {
    const tokens = new Tokenizer(source).tokenize()

    super(tokens)

    this.source = source
  }

  parse(): d.Program {
    const loc = this.startNode()

    const body = parseCompound<d.Statement>(this, parseStmt)

    // TODO: overload builder func type,
    // to detect we pass `loc` and its return type is surely `NodeWithLoc`
    return this.finishNode(buildProgram(body, loc))
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

  finishNode<T extends NodeType, N extends Nodes[T]>(
    node: NodeWithLoc<N>
  ): NodeWithLoc<N> {
    node.loc.end = this.getCurrentToken().loc.end

    if (debug.enabled) {
      const log = { ...node }
      delete log.loc
      debug(log)
    }

    return node as NodeWithLoc<N>
  }

  validateNode<T extends Array<NodeType>>(
    node: NodeWithLoc,
    ...types: T
  ): NodeWithLoc<Nodes[T[number]]> {
    if (!node.is(...types)) {
      throw createError(
        this.source,
        'expected ' + types.join(', '),
        node.loc.start,
        node.loc.end
      )
    }

    return node
  }

  validateToken<T extends TokenType, U extends string>(
    token: Token,
    type: T,
    value?: U
  ): Token & { type: T; value: U } {
    if (!isToken(token, type, value)) {
      throw createError(
        this.source,
        'expected ' + [type, value].join(', '),
        token.loc.start,
        token.loc.end
      )
    }

    return token as Token & { type: T; value: U }
  }
}
