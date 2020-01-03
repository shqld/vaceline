interface Doc {
  type: string
  depth: number
  lang: string
  value: string
  raw: string
  children: Array<Doc>
}
declare module '@textlint/markdown-to-ast' {
  export function parse(file: string): Doc
}
