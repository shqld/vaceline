import { Node } from '../nodes'
import { Printer } from './printer'
import { isNode } from '../utils/node'

export const generate = (ast: Node): { code: string; map?: string } => {
  const p = new Printer()

  if (isNode(ast, ['File'])) {
    return p.generate(ast.program)
  }

  if (isNode(ast, ['Program'])) {
    return p.generate(ast)
  }

  // TODO:
  throw new Error(`Unexpected ast node: ${ast}`)
}
