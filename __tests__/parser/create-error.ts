import { createError } from '../../src/parser/create-error'

describe('createError', () => {
  const shortSource = `
source1
`.trim()

  const mediumSource = `
source1
source2
source3
`.trim()

  const longSource = `
source1
source2
source3
source4
source5
source6
`.trim()

  it('a', () => {
    throw createError(longSource, 'aasdf', 40)
  })
})
