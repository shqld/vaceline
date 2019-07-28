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
        },
      ])

      expect(parse('"hello";').body).toMatchObject([
        {
          type: 'ExpressionStatement',
          body: {
            type: 'StringLiteral',
            value: '"hello"',
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
            },
            {
              type: 'StringLiteral',
            },
            {
              type: 'NumericLiteral',
            },
          ],
        },
      },
    ])
  })

  // it('should', () => {})
})
