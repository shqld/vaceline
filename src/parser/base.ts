import { Tokenizer, Token, TokenType } from './tokenizer'
import { Node, NodeType, NodeAs } from '../nodes'
import { createError } from './create-error'
import { TokenReader } from './token-reader'

import { isNode } from '../utils/node'
import { isToken } from '../utils/token'
import { PlainNode, Position, NodeWithLoc } from '../nodes/node'

interface Stack<T> {
  push: Array<T>['push']
  pop: Array<T>['pop']
}

export class ParserBase extends TokenReader {
  source: string

  constructor(source: string, opts: { keywords?: Array<string> } = {}) {
    const tokens = new Tokenizer(source, opts).tokenize()

    super(tokens)

    this.source = source
  }

  startNode(start?: Position): NodeWithLoc {
    const node = new Node()

    node.loc = {
      start: start || this.getCurrentLocation().start,
      end: null as any,
    }

    return node as NodeWithLoc
  }

  finishNode<T extends NodeType, N extends NodeAs<T>, V extends PlainNode<N>>(
    node: NodeWithLoc,
    type: T,
    values: V
  ): N {
    node.loc.end = this.getCurrentLocation().end

    return Node.build(node, type, values)
  }

  validateNode<T extends Array<NodeType>>(
    node: Node,
    type: T,
    message?: string
  ): NodeAs<T[number]> {
    if (!isNode(node, type)) {
      message = 'expected ' + type.join(', ') + (message ? message : '')

      const loc = node.loc!

      throw createError(this.source, message, loc.start, loc.end)
    }

    return node as NodeAs<T[number]>
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
