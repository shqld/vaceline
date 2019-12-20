import { BaseNode } from '../nodes'
import { doc as docHelpers } from 'prettier'

export const { builders } = docHelpers

const defaultPrintOptions: docHelpers.printer.Options = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
}

export const generate = (
  ast: BaseNode,
  options?: Partial<docHelpers.printer.Options>
): { code: string; map?: string } => {
  const { formatted } = docHelpers.printer.printDocToString(
    ast.print({}),
    options ? { ...defaultPrintOptions, ...options } : defaultPrintOptions
  )

  return { code: formatted }
}
