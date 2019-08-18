import debug from 'debug'

const vacel = debug('vacel')

// stderr is used by default but
// it is for printing output(code|ast)
vacel.log = console.log.bind(console)

export const buildDebug = vacel.extend.bind(vacel)

export { vacel as debugVacel }
