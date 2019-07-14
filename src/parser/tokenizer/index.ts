import chalk from 'chalk'

type TokenType =
  | 'identifier'
  | 'symbol'
  | 'operator'
  | 'keyword'
  | 'string'
  | 'boolean'
  | 'numeric'
  | 'duration'
  | 'ip'
  | 'comment'

interface Position {
  line: number
  column: number
}

interface Token {
  type: TokenType
  value: string
  start: number
  end: number
  loc: { start: Position; end: Position }
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
]

const symbols = [';', ',', '{', '}', '(', ')']
const operators = {
  binary: ['==', '!=', '>=', '>', '<=', '<', '~', '!~'],
  unary: ['!'],
  logical: ['||', '&&'],
  assign: ['=', '*=', '+=', '-=', '/=', '||=', '&&='],
}

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

const reSplitter = new RegExp('(' + getJoinedRegExp(splitters) + ')')

export class Tokenizer {
  raw: string
  source: ReadonlyArray<string>
  keywords: Set<string>
  symbols: Set<string>
  operators: Set<string>

  constructor(raw: string, opts: { keywords?: Array<string> } = {}) {
    this.raw = raw
    this.source = raw.split(reSplitter)

    this.keywords = new Set(
      opts.keywords ? [...keywords, ...opts.keywords] : keywords
    )
    this.symbols = new Set(symbols)
    this.operators = new Set([
      ...operators.binary,
      ...operators.unary,
      ...operators.logical,
      ...operators.assign,
    ])
  }

  // TODO: this method is still buggy in the case of source with too few lines
  createError(message: string, lineNum: number, colNum: number): SyntaxError {
    const topMargin = 2
    const bottomMargin = 1

    const topLine = lineNum - topMargin
    const bottomLine = lineNum + bottomMargin

    const hMark = '> '
    const vMark = '^'
    const pad = String(bottomLine).length

    const targets = this.raw
      .split('\n')
      .slice(topLine, bottomLine)
      .map((line, num) => {
        num++ // line index != line number

        const currentLine = topLine + num

        const lineIndicator = chalk.gray(
          String(currentLine).padStart(pad) + ' | '
        )

        if (currentLine === lineNum) {
          return (
            chalk.redBright.bold(hMark) +
            lineIndicator +
            line +
            '\n' +
            ' '.repeat(colNum + pad + '>  | '.length - 1) +
            chalk.redBright.bold(vMark)
          )
        }

        return ' '.repeat(hMark.length) + lineIndicator + line
      })

    const err = new SyntaxError(message + '\n\n' + targets.join('\n'))

    return err
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

      if (this.symbols.has(str)) {
        type = 'symbol'
      } else if (this.operators.has(str)) {
        type = 'operator'
      } else if (this.keywords.has(str)) {
        type = 'keyword'
      } else if (str.startsWith('"')) {
        type = 'string'
      } else if (str.startsWith('{"')) {
        type = 'string'

        // string can have newline inside
        const lines = str.split('\n')
        line += lines!.length - 1
        column = lines[lines.length - 1].length - (str.length - 1)
      } else if (/true|false/.test(str)) {
        type = 'boolean'
      } else if (/^\d[\d\.]*/.test(str)) {
        type = 'numeric'
      } else if (/\d(s|ms)/.test(str)) {
        type = 'duration'
      } else if (/"[a-fA-F0-9:.]+"(\/\d+)?/.test(str)) {
        type = 'ip'
      } else if (/^#|\/\/|\/\*/.test(str)) {
        type = 'comment'
      } else {
        type = 'identifier'

        if (!/^[A-Za-z][A-Za-z\d\.-_]*/.test(str)) {
          console.log(tokens.slice(-5))
          console.log(str)
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
      })
    }

    return tokens
  }
}
