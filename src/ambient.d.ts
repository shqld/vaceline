declare interface Class<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: Array<any>): T
}

declare const BUILD_ENV: 'production' | 'development'
declare const BUILD_PLATFORM: 'node' | 'browser'
