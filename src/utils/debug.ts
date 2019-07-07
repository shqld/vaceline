import debug from 'debug'

const vacel = debug('vacel')

// stderr is used by default but
// it is for printing output(code|ast)
vacel.log = console.log.bind(console)

export const parse = vacel.extend('parse')
export const traverse = vacel.extend('traverse')
export const generate = vacel.extend('generate')
