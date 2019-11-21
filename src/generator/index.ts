import { BaseNode } from '../nodes'
import { doc as docHelpers } from 'prettier'

export const { builders } = docHelpers

const defaultPrintOptions = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
}

export const generate = (ast: BaseNode): { code: string; map?: string } => {
  const { formatted } = docHelpers.printer.printDocToString(
    ast.print(),
    defaultPrintOptions
  )

  return { code: formatted }
}
