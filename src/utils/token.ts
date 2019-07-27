import {
  Token,
  LiteralToken,
  KeywordToken,
  TokenType,
  ValueTypeToken,
  ReturnTypeToken,
} from '../parser/tokenizer'

export const isLiteralToken = (t: Token): t is LiteralToken =>
  t.type === 'literal'
export const isKeywordToken = (t: Token): t is KeywordToken =>
  t.type === 'keyword'
export const isValueTypeToken = (t: Token): t is ValueTypeToken =>
  t.type === 'valueTypes'
export const isReturnTypeToken = (t: Token): t is ReturnTypeToken =>
  t.type === 'returnTypes'

export const isToken = <
  Type extends TokenType,
  Value extends string,
  RefinedToken extends Token & { type: Type; value: Value }
>(
  token: Token | null,
  type: Type,
  value?: Value
): token is RefinedToken =>
  !!token &&
  token.type === type &&
  (value !== undefined ? token.value === value : true)
