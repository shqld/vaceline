import { Token, TokenType } from '.'

export function isToken<
  Type extends TokenType,
  RefinedToken extends Token & { type: Type; value: string }
>(
  token: Token | undefined,
  type: Type,
  value?: string | RegExp
): token is RefinedToken {
  return (
    !!token &&
    token.type === type &&
    (value !== undefined
      ? value instanceof RegExp
        ? value.test(token.value)
        : token.value === value
      : true)
  )
}
