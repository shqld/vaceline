import debug from 'debug'

const vaceline = debug('vaceline')

// stderr is used by default but
// it is for printing output(code|ast)
vaceline.log = console.log.bind(console)

export const buildDebug = vaceline.extend.bind(vaceline)

export { vaceline as debugVacel }
