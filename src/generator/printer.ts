import { Buffer, SourcePosition } from './buffer'
import { Node, Printable, Mark, Identifier, Program } from '../nodes'
import { WithLocation } from '../parser/typings'
import { PrintList } from './lib'

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

  print(target: Printable | Array<Printable>, isProgram = false) {
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

    if (isList(target)) {
      if (!isProgram) {
        this.indent()
      }

      target.nodes.forEach((node, i) => {
        this.print(node)

        if (target.sep && i !== target.nodes.length - 1) {
          for (const s of target.sep) {
            this.append(s)
          }
        }
      })

      if (!isProgram) {
        this.dedent()
      }

      return
    }

    if (target instanceof Node) {
      this.print(target.print())
      return
    }

    if (hasLocation(target)) {
      this.append(target.value, target.loc.start)
      return
    }

    if (typeof target === 'string') {
      this.append(target)
      return
    }
  }

  generate(ast: Program) {
    this.print(ast.print(), true)

    this.buf.append('\n')

    return { code: this.buf.get() }
  }
}

// const isMark = (mark: any): mark is Mark => !(mark instanceof Node) && !!mark.loc
const isList = (list: any): list is PrintList => !!list.isList
const hasLocation = (target: any): target is Mark | WithLocation<Node> =>
  !!(target && target.loc)
