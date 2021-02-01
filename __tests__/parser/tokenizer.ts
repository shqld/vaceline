import { Tokenizer } from '../../src/parser/tokenizer'
import chalk from 'chalk'

// for test readability
const tokenize = (str: string) => new Tokenizer(str.trim()).tokenize()

describe('Tokenizer', () => {
  it('should tokenize a single ident', () => {
    const str = 'ident'.repeat(1)

    expect(tokenize(str)).toMatchObject([
      {
        type: 'ident',
        value: 'ident',
        loc: {
          end: {
            offset: 4,
            line: 1,
            column: 5,
          },
          start: {
            offset: 0,
            line: 1,
            column: 1,
          },
        },
      },
    ])
  })

  it('should tokenize a single ident', () => {
    const str = 'ident ident '.repeat(1)

    expect(tokenize(str)).toMatchObject([
      {
        type: 'ident',
        value: 'ident',
        loc: {
          end: {
            offset: 4,
            line: 1,
            column: 5,
          },
          start: {
            offset: 0,
            line: 1,
            column: 1,
          },
        },
      },
      {
        type: 'ident',
        value: 'ident',
        loc: {
          start: {
            offset: 6,
            line: 1,
            column: 7,
          },
          end: {
            offset: 10,
            column: 11,
            line: 1,
          },
        },
      },
    ])
  })

  it('should tokenize multiple idents', () => {
    expect(
      tokenize(
        `
ident   ident  i
ident
            `
      )
    ).toMatchObject([
      {
        type: 'ident',
        value: 'ident',
        loc: {
          start: {
            offset: 0,
            line: 1,
            column: 1,
          },
          end: {
            offset: 4,
            line: 1,
            column: 5,
          },
        },
      },
      {
        type: 'ident',
        value: 'ident',
        loc: {
          end: {
            offset: 12,
            line: 1,
            column: 13,
          },
          start: {
            offset: 8,
            line: 1,
            column: 9,
          },
        },
      },
      {
        type: 'ident',
        value: 'i',
        loc: {
          start: {
            offset: 15,
            line: 1,
            column: 16,
          },
          end: {
            offset: 15,
            line: 1,
            column: 16,
          },
        },
      },
      {
        type: 'ident',
        value: 'ident',
        loc: {
          start: {
            offset: 17,
            line: 2,
            column: 1,
          },
          end: {
            offset: 21,
            line: 2,
            column: 5,
          },
        },
      },
    ])
  })

  describe('keyword', () => {})

  describe('literal', () => {
    it('should tokenize quoted string', () => {
      const str = '"hello" "world"'.repeat(1)

      expect(tokenize(str)).toMatchObject([
        {
          type: 'string',
          value: '"hello"',
          loc: {
            start: {
              offset: 0,
              line: 1,
              column: 1,
            },
            end: {
              offset: 6,
              line: 1,
              column: 7,
            },
          },
        },
        {
          type: 'string',
          value: '"world"',
          loc: {
            start: {
              offset: 8,
              column: 9,
              line: 1,
            },
            end: {
              offset: 14,
              column: 15,
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
      ).toThrowError(/Invalid token/)
    })

    it('should tokenize quoted multiline string', () => {
      expect(
        tokenize(
          `
{"he
llo"} "hello"
        `
        )
      ).toMatchObject([
        {
          type: 'string',
          value: '{"he\nllo"}',
          loc: {
            start: {
              offset: 0,
              line: 1,
              column: 1,
            },
            end: {
              offset: 9,
              line: 2,
              column: 5,
            },
          },
        },
        {
          type: 'string',
          value: '"hello"',
          loc: {
            start: {
              offset: 11,
              line: 2,
              column: 7,
            },
            end: {
              offset: 17,
              line: 2,
              column: 13,
            },
          },
        },
      ])
    })

    it('should tokenize boolean', () => {
      expect(
        tokenize(`
          true
          false`)
      ).toMatchObject([
        {
          type: 'boolean',
          value: 'true',
        },
        {
          type: 'boolean',
          value: 'false',
        },
      ])
    })

    it('should tokenize numeric', () => {
      expect(tokenize('100')).toMatchObject([{ type: 'numeric', value: '100' }])

      expect(tokenize('100.01')).toMatchObject([
        { type: 'numeric', value: '100.01' },
      ])
    })
  })

  describe.skip('comment', () => {
    it('should tokenize', () => {
      expect(
        tokenize(`
before# comment
before// comment after
before/* comment */after
      `)
      ).toMatchObject([
        { type: 'ident', value: 'before' },
        { type: 'comment', value: '# comment' },
        { type: 'ident', value: 'before' },
        { type: 'comment', value: '// comment after' },
        { type: 'ident', value: 'before' },
        { type: 'comment', value: '/* comment */' },
        { type: 'ident', value: 'after' },
      ])
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
ident3 %%%
ident4
`
        )
      ).toThrow(
        `
Invalid token: '%%%'

  1 | ident1
  2 | ident2
> 3 | ident3 %%%
             ^^^
  4 | ident4
      `.trim()
      )
    })
  })
})
