export interface SourcePosition {
  identifierName?: string
  line: number
  column: number
  filename?: string
}

export class Buffer {
  private buf: Array<string> = []
  private innerQueue: Array<string> = []

  position: { line: number; column: number } = {
    line: 1,
    column: 0,
  }

  sourcePosition: SourcePosition = {
    // identifierName: ,
    line: 0,
    column: 0,
    // filename: ,
  }

  getBuf(): ReadonlyArray<string> {
    return this.buf
  }

  getQueue(): ReadonlyArray<string> {
    return this.innerQueue
  }

  getCurrentLine() {
    return this.position.line
  }

  getCurrentColumn() {
    return this.position.column
  }

  getSourcePosition() {
    return this.sourcePosition
  }

  getSourceLine() {
    return this.sourcePosition.line
  }

  getSourceColumn() {
    return this.sourcePosition.column
  }

  get(): string {
    this.flush()
    return this.buf.join('')
  }

  append(str: string, source?: SourcePosition): void {
    this.flush()
    this.moveCursor(str, source)
    this.buf.push(str)
  }

  removeTrailing(str: string) {
    if (this.endsWith(str)) {
      this.innerQueue.pop()
    }
  }

  endsWith(str: string) {
    return this.innerQueue[this.innerQueue.length - 1] === str
  }

  queue(str: string, source?: SourcePosition) {
    this.moveCursor(str, source)
    this.innerQueue.push(str)
  }

  moveCursor(str: string, source?: SourcePosition) {
    if (source) {
      this.sourcePosition = source
    }

    const lines = str.split('\n')

    const lineDelta = lines.length - 1
    this.position.line += lineDelta

    const lastLine = lines[lineDelta]
    if (lastLine.length == 0) {
      this.position.column = 0
    } else {
      this.position.column += lastLine.length
    }
  }

  flush() {
    if (!this.innerQueue.length) {
      return
    }

    for (const item of this.innerQueue) {
      this.buf.push(item)
    }

    this.innerQueue = []
  }
}
