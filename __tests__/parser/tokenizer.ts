import { Tokenizer } from '../../src/parser/tokenizer'
import chalk from 'chalk'

// for test readability
const tokenize = (str: string) => new Tokenizer(str.trim()).tokenize()

describe('Tokenizer', () => {
  it('should tokenize a single identifier', () => {
    const str = 'ident'.repeat(1)

    expect(tokenize(str)).toStrictEqual([
      {
        type: 'identifier',
        value: 'ident',
        start: 0,
        end: 4,
        loc: {
          end: {
            column: 5,
            line: 1,
          },
          start: {
            column: 1,
            line: 1,
          },
        },
      },
    ])
  })

  it('should tokenize a single identifier', () => {
    const str = 'ident ident '.repeat(1)

    expect(tokenize(str)).toStrictEqual([
      {
        type: 'identifier',
        value: 'ident',
        start: 0,
        end: 4,
        loc: {
          end: {
            column: 5,
            line: 1,
          },
          start: {
            column: 1,
            line: 1,
          },
        },
      },
      {
        type: 'identifier',
        value: 'ident',
        start: 6,
        end: 10,
        loc: {
          end: {
            column: 11,
            line: 1,
          },
          start: {
            column: 7,
            line: 1,
          },
        },
      },
    ])
  })

  it('should tokenize multiple identifiers', () => {
    expect(
      tokenize(
        `
ident   ident  i
ident
            `
      )
    ).toStrictEqual([
      {
        type: 'identifier',
        value: 'ident',
        start: 0,
        end: 4,
        loc: {
          end: {
            column: 5,
            line: 1,
          },
          start: {
            column: 1,
            line: 1,
          },
        },
      },
      {
        type: 'identifier',
        value: 'ident',
        start: 8,
        end: 12,
        loc: {
          end: {
            column: 13,
            line: 1,
          },
          start: {
            column: 9,
            line: 1,
          },
        },
      },
      {
        type: 'identifier',
        value: 'i',
        start: 15,
        end: 15,
        loc: {
          end: {
            column: 16,
            line: 1,
          },
          start: {
            column: 16,
            line: 1,
          },
        },
      },
      {
        type: 'identifier',
        value: 'ident',
        start: 17,
        end: 21,
        loc: {
          end: {
            column: 5,
            line: 2,
          },
          start: {
            column: 1,
            line: 2,
          },
        },
      },
    ])
  })

  describe('keyword', () => {})

  describe('literal', () => {
    it('should tokenize quoted string', () => {
      const str = '"hello" "world"'.repeat(1)

      expect(tokenize(str)).toStrictEqual([
        {
          type: 'string',
          value: '"hello"',
          start: 0,
          end: 6,
          loc: {
            end: {
              column: 7,
              line: 1,
            },
            start: {
              column: 1,
              line: 1,
            },
          },
        },
        {
          type: 'string',
          value: '"world"',
          start: 8,
          end: 14,
          loc: {
            end: {
              column: 15,
              line: 1,
            },
            start: {
              column: 9,
              line: 1,
            },
          },
        },
      ])
    })

    it('should fail when quoted string has newline', () => {
      expect(() =>
        tokenize(
          `
"he
llo"
        `
        )
      ).toThrowError(/invalid token/)
    })

    it('should tokenize quoted multiline string', () => {
      expect(
        tokenize(
          `
{"he
llo"} "hello"
        `
        )
      ).toStrictEqual([
        {
          type: 'string',
          value: '{"he\nllo"}',
          start: 0,
          end: 9,
          loc: {
            end: {
              column: 5,
              line: 2,
            },
            start: {
              column: 1,
              line: 1,
            },
          },
        },
        {
          type: 'string',
          value: '"hello"',
          start: 11,
          end: 17,
          loc: {
            end: {
              column: 13,
              line: 2,
            },
            start: {
              column: 7,
              line: 2,
            },
          },
        },
      ])
    })

    it('should tokenize boolean', () => {
      const tokens = tokenize(`
true
false`)

      expect(tokens.shift()).toStrictEqual(
        expect.objectContaining({
          type: 'boolean',
          value: 'true',
        })
      )
      expect(tokens.shift()).toStrictEqual(
        expect.objectContaining({
          type: 'boolean',
          value: 'false',
        })
      )
    })

    it('should tokenize numeric', () => {
      expect(tokenize('100').pop()).toStrictEqual(
        expect.objectContaining({ type: 'numeric', value: '100' })
      )

      expect(tokenize('100.01').pop()).toStrictEqual(
        expect.objectContaining({ type: 'numeric', value: '100.01' })
      )

      expect(() => tokenize('.11').pop()).toThrow(/invalid token/)
    })
  })

  describe('comment', () => {
    it('should tokenize', () => {
      const tokens = tokenize(`
before# comment
before// comment after
before/* comment */after
      `)

      expect(tokens.shift()).toStrictEqual(
        expect.objectContaining({ type: 'identifier', value: 'before' })
      )
      expect(tokens.shift()).toStrictEqual(
        expect.objectContaining({ type: 'comment', value: '# comment' })
      )
      expect(tokens.shift()).toStrictEqual(
        expect.objectContaining({ type: 'identifier', value: 'before' })
      )
      expect(tokens.shift()).toStrictEqual(
        expect.objectContaining({ type: 'comment', value: '// comment after' })
      )
      expect(tokens.shift()).toStrictEqual(
        expect.objectContaining({ type: 'identifier', value: 'before' })
      )
      expect(tokens.shift()).toStrictEqual(
        expect.objectContaining({ type: 'comment', value: '/* comment */' })
      )
      expect(tokens.shift()).toStrictEqual(
        expect.objectContaining({ type: 'identifier', value: 'after' })
      )
    })
  })

  describe('error-handling', () => {
    it('should emit SyntaxError', () => {
      chalk.enabled = false

      expect(() =>
        tokenize(
          `
ident1
ident2
ident3 %(%
ident4
`
        )
      ).toThrow(
        `
invalid token

  1 | ident1
  2 | ident2
> 3 | ident3 %(%
               ^
  4 | ident4
      `.trim()
      )
    })
  })
})
