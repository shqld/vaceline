import { Node } from '../nodes'
import { doc, Doc, util } from 'prettier'

export const { builders } = doc

const defaultPrintOptions = {
  printWidth: 100,
  tabWidth: 4,
  useTabs: false,
}

export const generate = (ast: Node): { code: string; map?: string } => {
  const { formatted } = doc.printer.printDocToString(
    ast.print(),
    defaultPrintOptions
  )

  return { code: formatted }
}
