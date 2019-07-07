import { Node, File, Program } from '../nodes'
import { Printer } from './printer'

export const generate = (ast: File | Node): { code: string; map?: string } => {
  const p = new Printer()

  if (ast instanceof File) {
    return p.generate(ast.program)
  }

  if (ast instanceof Program) {
    return p.generate(ast)
  }

  // TODO:
  throw new Error('')
}
