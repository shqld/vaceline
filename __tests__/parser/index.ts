import { parse } from '../../src'

describe('Parser', () => {
  describe('Program', () => {
    it('should parse literal', () => {
      expect(parse('true;').body).toMatchObject([
        {
          type: 'ExpressionStatement',
          body: {
            type: 'BooleanLiteral',
            value: 'true',
          },
          loc: {
            start: { offset: 0 },
            end: { offset: 4 },
          },
        },
      ])

      expect(parse('"hello";').body).toMatchObject([
        {
          type: 'ExpressionStatement',
          body: {
            type: 'StringLiteral',
            value: '"hello"',
          },
          loc: {
            start: { offset: 0 },
            end: { offset: 7 },
          },
        },
      ])

      expect(parse('100;').body).toMatchObject([
        {
          type: 'ExpressionStatement',
          body: {
            type: 'NumericLiteral',
            value: '100',
          },
          loc: {
            start: { offset: 0 },
            end: { offset: 3 },
          },
        },
      ])

      // FIXME: unexpectedly returned `NumericLiteral`
      // expect(parse('100s').body).toMatchObject([
      //   {
      //     type: 'ExpressionStatement',
      //     body: {
      //       type: 'DurationLiteral',
      //       value: '100s',
      //     },
      //   },
      // ])

      expect(parse('ident;').body).toMatchObject([
        {
          type: 'ExpressionStatement',
          body: {
            type: 'Identifier',
            name: 'ident',
          },
          loc: {
            start: { offset: 0 },
            end: { offset: 5 },
          },
        },
      ])
    })

    expect(parse('ident "hello" 100;').body).toMatchObject([
      {
        type: 'ExpressionStatement',
        body: {
          type: 'ConcatExpression',
          body: [
            {
              type: 'Identifier',
              loc: {
                start: { offset: 0 },
                end: { offset: 4 },
              },
            },
            {
              type: 'StringLiteral',
              loc: {
                start: { offset: 6 },
                end: { offset: 12 },
              },
            },
            {
              type: 'NumericLiteral',
              loc: {
                start: { offset: 14 },
                end: { offset: 16 },
              },
            },
          ],
        },
        loc: {
          start: { offset: 0 },
          end: { offset: 17 },
        },
      },
    ])
  })
})
