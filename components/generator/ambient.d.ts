declare module 'prettier/doc' {
  import { doc } from 'prettier'

  export { Doc } from 'prettier'
  export const builders: typeof doc.builders
  export const printer: typeof doc.printer
  export type PrinterOptions = doc.printer.Options
}
