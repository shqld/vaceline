declare interface Class<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: Array<any>): T
}

declare const BUILD_ENV: 'production' | 'development'
declare const BUILD_PLATFORM: 'node' | 'browser'

declare module 'prettier/doc' {
  import { doc } from 'prettier'

  export { Doc } from 'prettier'
  export const builders: typeof doc.builders
  export const printer: typeof doc.printer
  export type PrinterOptions = doc.printer.Options
}
