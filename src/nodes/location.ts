export interface Position {
  offset: number
  line: number
  column: number
}

export interface Location {
  start: Position
  end: Position
}

export const buildEmptryLocation = (): Location => ({
  start: {
    offset: NaN,
    line: NaN,
    column: NaN,
  },
  end: {
    offset: NaN,
    line: NaN,
    column: NaN,
  },
})
