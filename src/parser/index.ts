import { Program, Statement } from '../ast-nodes'
import { StatementParser } from './statement'

export const parse = (source: string) => new Parser(source).parse()

export class Parser extends StatementParser {
  parse(): Program {
    return this.parseProgram()
  }

  private parseProgram(): Program {
    return this.createNode('Program', () => {
      const body: Array<Statement> = []

      while (!this.isEOF()) {
        body.push(this.parseStmt(this.read()))
      }

      return { body }
    })
  }
}
