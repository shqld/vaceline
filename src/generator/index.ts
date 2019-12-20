import { BaseNode } from '../nodes'
import { doc as docHelpers } from 'prettier'

export const { builders } = docHelpers

type FormatOptions = docHelpers.printer.Options

export type GenerateOptions = {} & FormatOptions

const defaultGenerateOptions: GenerateOptions = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
}

export const generate = (
  ast: BaseNode,
  options: Partial<GenerateOptions> = defaultGenerateOptions
): { code: string; map?: string } => {
  const { formatted } = docHelpers.printer.printDocToString(
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
