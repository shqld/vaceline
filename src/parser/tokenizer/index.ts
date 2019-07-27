import { createError } from '../create-error'
import { Location } from '../../nodes'

export type TokenType =
  | 'identifier'
  | 'symbol'
  | 'operator'
  | 'keyword'
  | 'literal'
  | 'valueTypes'
  | 'returnTypes'
  | 'comment'

export interface Token {
  type: TokenType
  value: string
  start: number
  end: number
  loc: Location
}

export type LiteralType = 'string' | 'boolean' | 'numeric' | 'duration' | 'ip'

export interface LiteralToken extends Token {
  type: 'literal'
  literalType: LiteralType
  value: string
  raw: string
}

export interface KeywordToken extends Token {
  type: 'keyword'
  value: typeof keywords[number]
}

export interface ValueTypeToken extends Token {
  type: 'valueTypes'
  value: typeof valueTypes[number]
}

export interface ReturnTypeToken extends Token {
  type: 'returnTypes'
  value: typeof returnTypes[number]
}

const keywords = [
  'include',
  'import',
  'call',
  'declare',
  'local',
  'declare',
  'local',
  'add',
  'set',
  'unset',
  'return',
  'error',
  'restart',
  'synthetic',
  'log',
  'if',
  'else',
  'sub',
  'acl',
  'backend',
] as const

const symbols = [';', '.', ',', '{', '}', '(', ')'] as const
const operators = {
  binary: ['==', '!=', '>=', '>', '<=', '<', '~', '!~'],
  unary: ['!'],
  logical: ['||', '&&'],
  assign: ['=', '*=', '+=', '-=', '/=', '||=', '&&='],
} as const

const valueTypes = ['STRING', 'BOOL', 'BOOLEAN', 'INTEGER', 'FLOAT'] as const
const returnTypes = [
  'pass',
  'hit_for_pass',
  'lookup',
  'pipe',
  'deliver',
] as const

const escapeRegExp = (s: string | RegExp) =>
  s instanceof RegExp ? s.source : s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
const getJoinedRegExp = (s: Array<string | RegExp>) =>
  s.map(escapeRegExp).join('|')

const splitters = [
  /* spaces         */ / +/,
  /* newline        */ '\n',
  /* ip             */ /"[A-Fa-f0-9:.]+"(\/\d+)?/,
  /* string         */ /"[^\n]*?"/,
  /* multis tring   */ /{"[\s\S]*?"}/,
  /* line comment   */ /#[^\n]*|\/\/[^\n]*/,
  /* inline comment */ /\/\*[\s\S]*\*\//,
  ...symbols,
  ...operators.binary,
  ...operators.unary,
  ...operators.logical,
  ...operators.assign,
]

const matchers = {
  keywords: new Set(keywords),
  symbols: new Set(symbols),
  operators: new Set([
    ...operators.binary,
    ...operators.unary,
    ...operators.logical,
    ...operators.assign,
  ]),
  valueTypes: new Set(valueTypes),
  returnTypes: new Set(returnTypes),
} as const

const reSplitter = new RegExp('(' + getJoinedRegExp(splitters) + ')')

export class Tokenizer {
  raw: string
  source: ReadonlyArray<string>
  matchers: { [P in keyof typeof matchers]: Set<string> }

  constructor(raw: string, opts: { keywords?: Array<string> } = {}) {
    this.raw = raw
    this.source = raw.split(reSplitter)

    const keywords: typeof matchers.keywords = opts.keywords
      ? new Set([...(matchers.keywords as any), ...opts.keywords])
      : matchers.keywords

    this.matchers = {
      ...matchers,
      keywords,
    }

    this.matchers
    // opts.keywords ? [...keywords, ...opts.keywords] :
  }

  createError(message: string, line: number, col: number): SyntaxError {
    return createError(this.raw, message, line, col)
  }

  tokenize(): Array<Token> {
    const source = this.source
    const tokens = []

    let cur = 0

    let offset = 0
    let line = 1
    let column = 1

    while (cur < source.length) {
      const str = source[cur++]

      if (!str) {
        continue
      }

      // only whitespaces
      if (str.startsWith(' ')) {
        offset += str.length
        column += str.length

        continue
      }

      // newline
      if (str === '\n') {
        offset += str.length
        line++
        column = 1

        continue
      }

      let startOffset: number,
        startLine: number,
        startColumn: number,
        endOffset: number,
        endLine: number,
        endColumn: number

      /** determine token start */

      startOffset = offset
      startLine = line
      startColumn = column

      /** determine token type */

      let type: TokenType
      let literalType!: LiteralType

      if (this.matchers.symbols.has(str)) {
        type = 'symbol'
      } else if (this.matchers.operators.has(str)) {
        type = 'operator'
      } else if (this.matchers.keywords.has(str)) {
        type = 'keyword'
      } else if (this.matchers.valueTypes.has(str)) {
        type = 'valueTypes'
      } else if (this.matchers.returnTypes.has(str)) {
        type = 'returnTypes'
      } else if (str.startsWith('"')) {
        type = 'literal'
        literalType = 'string'
      } else if (str.startsWith('{"')) {
        type = 'literal'
        literalType = 'string'

        // string can have newline inside
        const lines = str.split('\n')
        line += lines!.length - 1
        column = lines[lines.length - 1].length - (str.length - 1)
      } else if (/true|false/.test(str)) {
        type = 'literal'
        literalType = 'boolean'
      } else if (/^\d[\d\.]*/.test(str)) {
        type = 'literal'
        literalType = 'numeric'
      } else if (/\d(s|ms)/.test(str)) {
        type = 'literal'
        literalType = 'duration'
      } else if (/"[a-fA-F0-9:.]+"(\/\d+)?/.test(str)) {
        type = 'literal'
        literalType = 'ip'
      } else if (/^#|\/\/|\/\*/.test(str)) {
        type = 'comment'
      } else {
        type = 'identifier'

        if (!/^[A-Za-z][A-Za-z\d\.-_]*/.test(str)) {
          throw this.createError('invalid token', line, column)
        }
      }

      /** update position */

      offset += str.length
      column += str.length

      /** determine token end */

      endOffset = offset - 1
      endLine = line
      endColumn = column - 1

      tokens.push({
        type,
        value: str,
        start: startOffset!,
        end: endOffset,
        loc: {
          start: { line: startLine!, column: startColumn! },
          end: { line: endLine, column: endColumn },
        },
        literalType,
      })
    }

    return tokens as Array<Token>
  }
}
