import { Node, BaseNode, Program, NodeWithLoc } from '../nodes'
import { doc as docHelpers, Doc, util } from 'prettier'
import { Token } from '../parser/tokenizer'

export const { builders } = docHelpers

const defaultPrintOptions = {
  printWidth: 100,
  tabWidth: 2,
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

const generateDocFromAst = (ast: NodeWithLoc, i: number = 0): Doc => {
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

const printComment = (ast: Node, comments: Array<Token>, i: number = 0) => {
  // @ts-ignore FIXME:
  if (ast.comments) {
    // @ts-ignore FIXME:
    const comment = ast.comments[i]

    // FIXME: number comparison
    if (
      ast.loc.start.offset <= comment.loc.start.offset &&
      comment.loc.end.offset < ast.loc.end.offset
    ) {
      builders.concat([comment.value, doc])
    }
  }
}

export const generate = (ast: Node): { code: string; map?: string } => {
  if (ast instanceof Program) {
    const { comments } = ast
    return doc, comments
  }

  const doc = generateDocFromAst(ast)

  const { formatted } = docHelpers.printer.printDocToString(
    doc,
    defaultPrintOptions
  )

  return { code: formatted }
}
