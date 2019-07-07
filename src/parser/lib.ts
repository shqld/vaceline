import {
  Parser,
  Index,
  seq,
  seqMap,
  string,
  optWhitespace,
  alt,
  index,
} from 'parsimmon'
import { Comment } from './comment'

const mark = <T>(parser: Parser<T>) =>
  seqMap(index, parser, index, (start: Index, value: T, end: Index) => ({
    value,
    loc: {
      start,
      end,
    },
  }))
const margin = <T>(p: Parser<T>) => p.skip(optWhitespace)
const semi = <T>(p: Parser<T>) => p.skip(symbols.semiclon)
const bracket = <T>(p: Parser<T>) =>
  grease(symbols.lbracket.thru(mark), p, symbols.rbracket.thru(mark))
const paren = <T>(p: Parser<T>) =>
  grease(symbols.lparen.thru(mark), p, symbols.rparen.thru(mark))
const list = <T>(p: Parser<T>) =>
  alt(p, Comment)
    .thru(margin)
    .many()

// Can be used via `parser.thru` method
export const wrappers = {
  margin,
  semi,
  bracket,
  paren,
  list,
}

const oneOfWords = (...words: Array<string>) => alt(...words.map(string))
const directive = (d: string) => margin(string(d))
// @ts-ignore
const grease: typeof seq = (...ps) => seq(...ps.map(margin))

export const helpers = {
  oneOfWords,
  grease,
  directive,
}

const semiclon = wrappers.margin(string(';'))
const lbracket = wrappers.margin(string('{'))
const rbracket = wrappers.margin(string('}'))
const lparen = wrappers.margin(string('('))
const rparen = wrappers.margin(string(')'))
const comma = wrappers.margin(string(','))
const binop = oneOfWords('==', '!=', '>=', '>', '<=', '<', '~', '!~')
const unop = oneOfWords('!')
const logop = oneOfWords('||', '&&')
const assigop = oneOfWords('=', '*=', '+=', '-=', '/=', '||=', '&&=')

export const symbols = {
  semiclon,
  lbracket,
  rbracket,
  lparen,
  rparen,
  comma,
  binop,
  unop,
  logop,
  assigop,
}
