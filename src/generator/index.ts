import { BaseNode } from '../nodes'
import { doc as docHelpers, Options as PrintOptions } from 'prettier'

export const { builders } = docHelpers

const defaultPrintOptions = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
}

export const generate = (
  ast: BaseNode,
  options?: PrintOptions
): { code: string; map?: string } => {
  const { formatted } = docHelpers.printer.printDocToString(
    ast.print(),
    options ? { ...defaultPrintOptions, ...options } : defaultPrintOptions
  )

  return { code: formatted }
}
