import { Buffer, SourcePosition } from './buffer'
import { Node, nodeDefs, NodeType, NodeDef } from '../nodes'
import { Program } from '../ast-nodes'
import { NodeWithLocation } from '../nodes/node'

export class Printer {
  buf: Buffer
  // indentWidth: number
  indentLevel: number

  constructor() {
    this.buf = new Buffer()
    // this.indentWidth = 2
    this.indentLevel = 0
    // Later this should be implemented as sourcePosition in Buffer
  }

  indent() {
    this.indentLevel++
  }

  dedent() {
    this.indentLevel--
  }

  space() {
    this.append(' ')
  }

  newline() {
    this.buf.removeTrailing(' ')
    this.buf.append('\n')
  }

  private append(str: string, loc?: SourcePosition) {
    if (this.buf.getCurrentColumn() === 0) {
      this.buf.queue('  '.repeat(this.indentLevel))
    }
    this.buf.queue(str, loc)
  }

  print(target: Node | string | Array<Node | string>, isProgram = false) {
    if (Array.isArray(target)) {
      target.forEach((t) => this.print(t))
      return
    }

    if (hasLocation(target)) {
      const { loc } = target

      while (
        this.buf.getCurrentLine() < loc.start.line &&
        this.buf.getSourceLine() < loc.start.line
      ) {
        this.newline()
        this.buf.sourcePosition.line++
      }
    }

    if (target instanceof Node) {
      const def: NodeDef<any> = nodeDefs[target.type as NodeType]

      this.print(def.print(target))
      return
    }

    if (hasLocation(target)) {
      this.append(target, target.loc.start)
      return
    }

    if (typeof target === 'string') {
      this.append(target)
      return
    }
  }

  generate(ast: Program) {
    this.print(nodeDefs['Program'].print(ast), true)

    this.buf.append('\n')

    return { code: this.buf.get() }
  }
}

const hasLocation = (target: any): target is NodeWithLocation =>
  !!(target && target.loc)
