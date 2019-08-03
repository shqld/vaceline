export const binary = ['==', '!=', '>=', '>', '<=', '<', '~', '!~']
export const unary = ['!']
export const logical = ['||', '&&']
export const assign = ['=', '*=', '+=', '-=', '/=', '||=', '&&=']

export const operators = [...binary, ...unary, ...logical, ...assign]
