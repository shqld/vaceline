import { printer, PrinterOptions } from 'prettier/doc'
import { Node } from '../nodes/defs'

export type GenerateOptions = {} & PrinterOptions

const defaultGenerateOptions: GenerateOptions = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
}

export const generate = (
  ast: Node,
  options: Partial<GenerateOptions> = defaultGenerateOptions
): { code: string; map?: string } => {
  const { formatted } = printer.printDocToString(
    ast.print({
      lineNum: 1,
    }),
    {
      printWidth: options.printWidth ?? defaultGenerateOptions.printWidth,
      tabWidth: options.tabWidth ?? defaultGenerateOptions.tabWidth,
      useTabs: options.useTabs ?? defaultGenerateOptions.useTabs,
    }
  )

  return { code: formatted }
}
