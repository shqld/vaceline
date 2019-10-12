import { Tokenizer, Token, TokenType } from './tokenizer'
import {
  Node,
  Program,
  Statement,
  NodeType,
  PlainNode,
  NodeWithLoc,
  NodeMap,
} from '../nodes'
import { createError } from './create-error'
import { TokenReader } from './token-reader'

import { isNode } from '../utils/node'
import { isToken } from '../utils/token'
import { parseStmt } from './statement/index'
import { parseCompound } from './compound'
import { buildDebug } from '../utils/debug'

const debug = buildDebug('parser')

export const parse = (source: string) => new Parser(source).parse()

export class Parser extends TokenReader {
  source: string

  constructor(source: string, opts: { keywords?: Array<string> } = {}) {
    const tokens = new Tokenizer(source, opts).tokenize()

    super(tokens)

    this.source = source
  }

  parse(): Program {
    return this.parseProgram()
  }

  private parseProgram(): Program {
    const node = this.startNode()

    const body = parseCompound<Statement>(this, parseStmt)

    return this.finishNode(node, 'Program', { body })
  }

  startNode(): NodeWithLoc {
    // @ts-ignore
    const node = new Node()

    const startToken = this.getCurrentToken()
    const start = startToken
      ? startToken.loc.start
      : { offset: 0, line: 1, column: 1 }

    node.loc = {
      start,
      end: undefined,
    }

    return node as NodeWithLoc
  }

  finishNode<
    T extends NodeType,
    N extends InstanceType<NodeMap[T]>,
    V extends PlainNode<N>
  >(node: NodeWithLoc, type: T, values: V): N {
    node.loc.end = this.getCurrentToken()!.loc.end

    const finished = Node.build(node, type, values)

    if (debug.enabled) {
      const log = { ...finished }
      delete log.loc
      debug(log)
    }

    return finished
  }

  validateNode<T extends Array<NodeType>>(
    node: Node,
    type: T,
    message?: string
  ): InstanceType<NodeMap[T[number]]> {
    if (!isNode(node, type)) {
      message = 'expected ' + type.join(', ') + (message ? message : '')

      const loc = node.loc!

      throw createError(this.source, message, loc.start, loc.end)
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
