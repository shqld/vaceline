import { printer, PrinterOptions } from 'prettier/doc'
import { Node } from '../nodes/defs'
import { Token } from '../parser/tokenizer'

export type GenerateOptions = {
  comments: Array<Token>
} & PrinterOptions

const defaultGenerateOptions: GenerateOptions = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  comments: [],
}

export class CommentReader {
  comments: Array<Token>
  cur: number

  constructor(comments: Array<Token> = []) {
    this.comments = comments
    this.cur = 0
  }

  peek(): Token | null {
    return this.comments[this.cur]
  }

  take(): void {
    this.cur++
  }
}

export const generate = (
  ast: Node,
  options: Partial<GenerateOptions> = defaultGenerateOptions
): { code: string; map?: string } => {
  const { formatted } = printer.printDocToString(
    ast.print({
      pos: { offset: 0, line: 0, column: 0 },
      comments: new CommentReader(options.comments),
    }),
    {
      printWidth: options.printWidth ?? defaultGenerateOptions.printWidth,
      tabWidth: options.tabWidth ?? defaultGenerateOptions.tabWidth,
      useTabs: options.useTabs ?? defaultGenerateOptions.useTabs,
    }
  )

  return { code: formatted }
}
