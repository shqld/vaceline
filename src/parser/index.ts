import { Program, Statement } from '../ast-nodes'
import { Tokenizer, Token, TokenType } from './tokenizer'
import { Node, NodeType, NodeAs } from '../nodes'
import { createError } from './create-error'
import { TokenReader } from './token-reader'

import { isNode } from '../utils/node'
import { isToken } from '../utils/token'
import { PlainNode, NodeWithLoc } from '../nodes/node'
import { parseStmt } from './statement'

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

    const body: Array<Statement> = []

    while (!this.isEOF()) {
      body.push(parseStmt(this))
    }

    return this.finishNode(node, 'Program', { body })
  }

  startNode(): NodeWithLoc {
    const node = new Node()

    const startToken = this.getCurrentToken()
    const start = startToken
      ? startToken.loc.start
      : { offset: 0, line: 1, column: 1 }

    node.loc = {
      start,
      end: null as any,
    }

    return node as NodeWithLoc
  }

  finishNode<T extends NodeType, N extends NodeAs<T>, V extends PlainNode<N>>(
    node: NodeWithLoc,
    type: T,
    values: V
  ): N {
    node.loc.end = this.getCurrentToken()!.loc.end

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
