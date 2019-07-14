export const binary = new Set(['==', '!=', '>=', '>', '<=', '<', '~', '!~'])
export const unary = new Set(['!'])
export const logical = new Set(['||', '&&'])
export const assign = new Set(['=', '*=', '+=', '-=', '/=', '||=', '&&='])

export const operators = new Set([...binary, ...unary, ...logical, ...assign])

export const getPrecedence = (op: string) => {
  if (binary.has(op)) return 1
  if (op === '&&') return 2
  if (op === '||') return 3
  return 0
}
