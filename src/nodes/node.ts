export interface Position {
  line: number
  column: number
}

export interface Location {
  start: Position
  end: Position
}

export class Node {
  type!: string
  start?: number
  end?: number
  loc?: Location
}
