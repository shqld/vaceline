export interface Position {
  offset: number
  line: number
  column: number
}

export interface Location {
  start: Position
  end: Position
}
