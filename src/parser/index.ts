import { Tokenizer, Token, TokenType } from './tokenizer'
import { Location } from '../nodes'
import * as d from '../nodes'
import { createError } from './create-error'
import { TokenReader } from './token-reader'

import { isToken } from '../utils/token'
import { parseStmt } from './statement/index'
import { parseCompound } from './compound'
import { buildDebug } from '../utils/debug'

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
    return this.finishNode(d.Program.create({ body, loc }))
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

  finishNode(node: d.Node & { loc: Location }): d.Node {
    node.loc.end = this.getCurrentToken().loc.end

    if (debug.enabled) {
      const log = { ...node }
      delete log.loc
      debug(log)
    }

    return node
  }

  validateNode<T extends MultipleKlass>(
    node: d.Node & { loc: Location },
    ...types: T
  ): inferNodeFromMultipleKlass<T> & { loc: Location } {
    if (!types.some((type) => node instanceof type))
      throw createError(
        this.source,
        'expected ' + types.join(', '),
        node.loc.start,
        node.loc.end
      )

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

type MultipleKlass<T extends d.Node = d.Node> = Array<{ new (): T }>
type inferNodeFromMultipleKlass<
  T extends MultipleKlass
> = T extends MultipleKlass<infer U> ? U : never
