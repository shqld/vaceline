import { Node, BaseNode } from '../nodes'
import { doc as docHelpers, Doc, util } from 'prettier'

export const { builders } = docHelpers

const defaultPrintOptions = {
  printWidth: 100,
  tabWidth: 4,
  useTabs: false,
}

const traverseArrayForNode = <
  D extends Doc,
  K extends keyof D,
  T extends D & { [k in K]: Array<Doc | Node> }
>(
  doc: D,
  prop: K
): D => {
  const arr: Array<Doc | Node> = (doc as T)[prop]

  let i = arr.length

  while (i--) {
    const item = arr[i]

    if (item instanceof BaseNode) {
      arr[i] = generateDocFromAst(item)
    }
  }

  return doc
}

const generateDocFromAst = (ast: Node): Doc => {
  const doc = ast.print()

  if (typeof doc === 'string') {
    return doc
  }

  switch (doc.type) {
    case 'align':
      return traverseArrayForNode(doc, 'contents')
    case 'concat':
    case 'fill':
      return traverseArrayForNode(doc, 'parts')
    case 'group':
      return traverseArrayForNode(doc, 'contents')
    case 'if-break':
      return traverseArrayForNode(
        traverseArrayForNode(doc, 'breakContents'),
        'flatContents'
      )
    case 'indent':
      return traverseArrayForNode(doc, 'contents')
    case 'line':
    case 'line-suffix':
    case 'line-suffix-boundary':
    default:
      return doc
  }
}

export const generate = (ast: Node): { code: string; map?: string } => {
  const doc = generateDocFromAst(ast)

  const { formatted } = docHelpers.printer.printDocToString(
    doc,
    defaultPrintOptions
  )

  return { code: formatted }
}
