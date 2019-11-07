import fs from 'fs'
import path from 'path'

import { Printer } from '../../src/generator/printer'
import { Buffer } from '../../src/generator/buffer'

describe('Buffer', () => {
  it('should buf correctly', () => {
    const b = new Buffer()

    b.append('a')
    expect(b.getBuf()).toStrictEqual(['a'])

    b.queue('b')
    expect(b.getQueue()).toStrictEqual(['b'])

    b.flush()
    expect(b.getBuf()).toStrictEqual(['a', 'b'])
    expect(b.getQueue()).toStrictEqual([])

    b.queue('c')
    b.queue('de')
    expect(b.endsWith('c')).toBeFalsy()
    expect(b.endsWith('d')).toBeFalsy()
    expect(b.endsWith('de')).toBeTruthy()
  })

  it('should keep position', () => {
    const b = new Buffer()

    expect(b.position).toStrictEqual({
      line: 1,
      column: 0,
    })

    b.append('a')
    expect(b.position).toStrictEqual({
      line: 1,
      column: 1,
    })
    b.append('b')
    expect(b.position).toStrictEqual({
      line: 1,
      column: 2,
    })
    b.append('\nc\n')
    expect(b.position).toStrictEqual({
      line: 3,
      column: 0,
    })
    b.append('\n\n\n')
    expect(b.position).toStrictEqual({
      line: 6,
      column: 0,
    })
  })

  // it('should keep source position', () => {
  //   const b = new Buffer()
  // })
})
