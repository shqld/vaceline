import { createError } from '../create-error'
import { Location, Position } from '../../nodes'
import { operators } from './operators'
import { buildDebug } from '../../utils/debug'

const debug = buildDebug('tokenize')
const debugToken = debug.extend('token')
const debugRaw = debug.extend('raw')

export type TokenType =
  | 'ident'
  | 'symbol'
  | 'operator'
  | 'comment'
  | 'string'
  | 'numeric'
  | 'boolean'

export interface Token {
  type: TokenType
  value: string
  loc: Location
}

const symbols = [';', ':', '.', ',', '/', '{', '}', '(', ')', '+'] as const

const escapeRegExp = (s: string | RegExp) =>
  s instanceof RegExp ? s.source : s.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
const getJoinedRegExp = (s: Array<string | RegExp>) =>
  s.map(escapeRegExp).join('|')

const splitters = [
  /* spaces         */ / +/,
  /* newline        */ '\n',
  /* line comment   */ /#[^\n]*|\/\/[^\n]*/,
  /* inline comment */ /\/\*[\s\S]*\*\//,
  /* string         */ /"[^\n]*?"/,
  /* multiline str  */ /{"[\s\S]*?"}/,
  /* ident          */ /[A-z][A-z\d-_]*/,
  /* numeric        */ /[\d][\d\.]+/,
  ...operators,
  ...symbols,
]

const matchers = {
  symbols: new Set(symbols),
  operators: new Set(operators),
} as const

const reSplitter = new RegExp('(' + getJoinedRegExp(splitters) + ')')

export class Tokenizer {
  raw: string
  source: ReadonlyArray<string>

  constructor(raw: string, opts: { keywords?: Array<string> } = {}) {
    this.raw = raw
    this.source = raw.split(reSplitter)

    if (debugRaw.enabled) {
      debugRaw(this.source.filter((t) => !/^\s*$/.test(t)))
    }
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

      let err: string

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

      if (matchers.symbols.has(str as any)) {
        type = 'symbol'
      } else if (matchers.operators.has(str as any)) {
        type = 'operator'
      } else if (/^(true|false)$/.test(str)) {
        type = 'boolean'
      } else if (str.startsWith('"')) {
        type = 'string'

        if (!str.endsWith('"') || str === '"') {
          err =
            'invalid token (string may have newlines inside normal quotes, use `{" "}`)'
        }
      } else if (str.startsWith('{"')) {
        type = 'string'

        // string can have newline inside
        const lines = str.split('\n')
        line += lines!.length - 1
        column = lines[lines.length - 1].length - (str.length - 1)
      } else if (/^[\d\.]+$/.test(str)) {
        type = 'numeric'
      } else if (/^(#|\/\/|\/\*)/.test(str)) {
        type = 'comment'
      } else {
        type = 'ident'

        if (!/^[A-Za-z][A-Za-z\d\.-_]*/.test(str)) {
          err = 'invalid token'
        }
      }

      /** update position */

      offset += str.length
      column += str.length

      /** determine token end */

      endOffset = offset - 1
      endLine = line
      endColumn = column - 1

      // @ts-ignore
      if (err) {
        throw createError(
          this.raw,
          err,
          {
            offset: startOffset,
            line: startLine,
            column: startColumn,
          },
          {
            offset: endOffset,
            line: endLine,
            column,
          }
        )
      }

      const token = {
        type,
        value: str,
        loc: {
          start: { offset: startOffset, line: startLine, column: startColumn },
          end: { offset: endOffset, line: endLine, column: endColumn },
        },
      }

      if (debugToken.enabled) {
        debugToken(`${token.type}: ${token.value}`)
      }

      tokens.push(token)
    }

    return tokens as Array<Token>
  }
}
