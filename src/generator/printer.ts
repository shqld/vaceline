import { Buffer, SourcePosition } from './buffer'
import { Node, NodeWithLoc, Program } from '../nodes'

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
      // @ts-ignore FIXME:
      this.print(target.print())
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
    // @ts-ignore FIXME:
    this.print(ast.print(), true)

    this.buf.append('\n')

    return { code: this.buf.get() }
  }
}

const hasLocation = (target: any): target is NodeWithLoc =>
  !!(target && target.loc)
