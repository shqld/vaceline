import { Token, KeywordToken, TokenType } from '../parser/tokenizer'

export const isKeywordToken = (t: Token): t is KeywordToken =>
  t.type === 'keyword'

export const isToken = <
  Type extends TokenType,
  RefinedToken extends Token & { type: Type; value: string }
>(
  token: Token | null,
  type: Type,
  value?: string | RegExp
): token is RefinedToken =>
  !!token &&
  token.type === type &&
  (value !== undefined
    ? value instanceof RegExp
      ? value.test(token.value)
      : token.value === value
    : true)
