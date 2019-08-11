import debug, { Debugger, Formatters } from 'debug'

const vacel = debug('vacel')

// stderr is used by default but
// it is for printing output(code|ast)
vacel.log = console.log.bind(console)

type BuildDebug = (
  ...scopes: Array<string>
) => Debugger & {
  build: BuildDebug
}

const createBuildDebug = (base: Debugger) => (...scopes: Array<string>) => {
  const debug = base.extend(scopes.join(':')) as Debugger & {
    build: BuildDebug
  }

  debug.build = createBuildDebug(debug)

  return debug
}

export const buildDebug = createBuildDebug(vacel)
