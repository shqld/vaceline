const chalk: typeof import('chalk').default =
  // FIXME: remove undefined handling after server-side is also built by webpack
  typeof BUILD_PLATFORM !== 'undefined' && BUILD_PLATFORM === 'browser'
    ? {}
    : require('chalk')

const emptyChalk = (s: string) => s

export const red = chalk ? chalk.redBright.bold : emptyChalk
export const gray = chalk ? chalk.gray : emptyChalk
