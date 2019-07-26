import { parse } from '../../src/parser'

describe('Parser', () => {
  describe('Program', () => {
    it('should parse literal', () => {
      expect(parse('true;').body).toStrictEqual([
        expect.objectContaining({
          type: 'ExpressionStatement',
          body: expect.objectContaining({
            type: 'BooleanLiteral',
            value: 'true',
          }),
        }),
      ])

      expect(parse('"hello";').body).toStrictEqual([
        expect.objectContaining({
          type: 'ExpressionStatement',
          body: expect.objectContaining({
            type: 'StringLiteral',
            value: '"hello"',
          }),
        }),
      ])

      expect(parse('100;').body).toStrictEqual([
        expect.objectContaining({
          type: 'ExpressionStatement',
          body: expect.objectContaining({
            type: 'NumericLiteral',
            value: '100',
          }),
        }),
      ])

      // FIXME: unexpectedly returned `NumericLiteral`
      // expect(parse('100s').body).toStrictEqual([
      //   expect.objectContaining({
      //     type: 'ExpressionStatement',
      //     body: expect.objectContaining({
      //       type: 'DurationLiteral',
      //       value: '100s',
      //     }),
      //   }),
      // ])

      expect(parse('ident;').body).toStrictEqual([
        expect.objectContaining({
          type: 'ExpressionStatement',
          body: expect.objectContaining({
            type: 'Identifier',
            name: 'ident',
          }),
        }),
      ])
    })

    expect(parse('ident "hello" 100;').body).toStrictEqual([
      expect.objectContaining({
        type: 'ExpressionStatement',
        body: expect.objectContaining({
          type: 'ConcatExpression',
          body: [
            expect.objectContaining({
              type: 'Identifier',
            }),
            expect.objectContaining({
              type: 'StringLiteral',
            }),
            expect.objectContaining({
              type: 'NumericLiteral',
            }),
          ],
        }),
      }),
    ])
  })

  // it('should', () => {})
})
