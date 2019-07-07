export const flat = <U>(arr: Array<U[] | U>): U[] =>
  arr.reduce((acc: U[], val) => acc.concat(val), [])
export const join = (arr: Array<string>) => arr.join('')
export const nullOr = (val?: any) => (val !== undefined ? val : null)
