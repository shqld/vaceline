import { Parser } from '../../src/parser'
import { BinaryExpression, LogicalExpression } from '../../src/ast-nodes'

// @ts-ignore private method
const parseExpr = (source: string) => new Parser(source).parseExpr()

describe('Expression', () => {
  it('should be parsed', () => {
    parseExpr(`{"

    "} req.http.b`)
    parseExpr(
      'http_status_matches(resp.status, "404") && beresp.status == "404"'
    )
  })

  describe('ConcatExpression', () => {
    it('should be parsed', () => {
      expect(parseExpr('"a" "b" "c"')).toMatchObject({
        type: 'ConcatExpression',
        body: [
          { type: 'StringLiteral', value: '"a"' },
          { type: 'StringLiteral', value: '"b"' },
          { type: 'StringLiteral', value: '"c"' },
        ],
      })
      expect(
        parseExpr(`req.http.Host {"
      a
      "} true             100`)
      ).toMatchObject({
        type: 'ConcatExpression',
        body: [
          { type: 'Identifier' },
          { type: 'StringLiteral' },
          { type: 'BooleanLiteral' },
          { type: 'NumericLiteral' },
        ],
      })
    })
  })

  describe('FunCallExpression', () => {
    it('should be parsed', () => {
      expect(
        parseExpr('http_status_matches(resp.status, "404")')
      ).toMatchObject({
        type: 'FunCallExpression',
        callee: { type: 'Identifier' },
        arguments: [{ type: 'Identifier' }, { type: 'StringLiteral' }],
      })
      expect(parseExpr('if (req.http.b, a, b)')).toMatchObject({
        type: 'FunCallExpression',
        callee: { type: 'Identifier', value: 'if' },
        arguments: [
          { type: 'Identifier' },
          { type: 'Identifier' },
          { type: 'Identifier' },
        ],
      })
      expect(() =>
        parseExpr(`
      if (http_status_matches(resp.status, "404") && beresp.status == "404") {
        set req.http.A = "Not Found";
      }
    `)
      ).toThrow('SyntaxError')
    })
  })

  describe('BinaryExpression', () => {
    it('should parse', () => {
      expect(() =>
        parseExpr(
          'req.http.isCorrect == true != true <= true ~ true && (true || true)'
        )
      ).not.toThrow()
    })

    it('should be parsed', () => {
      expect(parseExpr('a == b')).toMatchObject({
        type: 'BinaryExpression',
        operator: '==',
        left: {
          name: 'a',
          loc: { start: { offset: 0 }, end: { offset: 0 } },
        },
        right: {
          name: 'b',
          loc: { start: { offset: 5 }, end: { offset: 5 } },
        },
        loc: { start: { offset: 0 }, end: { offset: 5 } },
      } as BinaryExpression)

      expect(parseExpr('req.http.a ~ "a"')).toMatchObject({
        type: 'BinaryExpression',
      })
    })

    it('should parse nested expressions', () => {
      expect(parseExpr('a == b != c')).toMatchObject({
        type: 'BinaryExpression',
        operator: '!=',
        left: {
          type: 'BinaryExpression',
          operator: '==',
          left: {
            name: 'a',
            loc: { start: { offset: 0 }, end: { offset: 0 } },
          },
          right: {
            name: 'b',
            loc: { start: { offset: 5 }, end: { offset: 5 } },
          },
        },
        right: {
          name: 'c',
          loc: { start: { offset: 10 }, end: { offset: 10 } },
        },
        loc: { start: { offset: 0 }, end: { offset: 10 } },
      } as BinaryExpression)
    })

    it('should take the precedence over first one', () => {
      expect(parseExpr('a == b == c')).toMatchObject({
        left: { left: { name: 'a' }, right: { name: 'b' } },
        right: { name: 'c' },
      } as BinaryExpression)
    })
  })

  describe('LogicalExpression', () => {
    it('should be parsed', () => {
      expect(parseExpr('a && b')).toMatchObject({
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          name: 'a',
          loc: { start: { offset: 0 }, end: { offset: 0 } },
        },
        right: {
          name: 'b',
          loc: { start: { offset: 5 }, end: { offset: 5 } },
        },
        loc: { start: { offset: 0 }, end: { offset: 5 } },
      } as LogicalExpression)

      expect(parseExpr('a || b')).toMatchObject({
        type: 'LogicalExpression',
        operator: '||',
        left: {
          name: 'a',
          loc: { start: { offset: 0 }, end: { offset: 0 } },
        },
        right: {
          name: 'b',
          loc: { start: { offset: 5 }, end: { offset: 5 } },
        },
        loc: { start: { offset: 0 }, end: { offset: 5 } },
      })
    })

    it('should parse nested expressions', () => {
      expect(parseExpr('a && b && c')).toMatchObject({
        type: 'LogicalExpression',
        operator: '&&',
        left: {
          type: 'LogicalExpression',
          operator: '&&',
          left: {
            name: 'a',
            loc: { start: { offset: 0 }, end: { offset: 0 } },
          },
          right: {
            name: 'b',
            loc: { start: { offset: 5 }, end: { offset: 5 } },
          },
        },
        right: {
          name: 'c',
          loc: { start: { offset: 10 }, end: { offset: 10 } },
        },
        loc: { start: { offset: 0 }, end: { offset: 10 } },
      })
    })

    it('should take the precedence over first one', () => {
      expect(parseExpr('a && b && c')).toMatchObject({
        left: { left: { name: 'a' }, right: { name: 'b' } },
        right: { name: 'c' },
      } as LogicalExpression)
    })

    it('should take the precedence over `&&`', () => {
      expect(parseExpr('a || b && c')).toMatchObject({
        type: 'LogicalExpression',
        operator: '||',
        right: { operator: '&&' },
      } as LogicalExpression)
    })

    it('should take the precedence over BinaryExpression', () => {
      expect(parseExpr('a == b && c != d')).toMatchObject({
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'BinaryExpression', operator: '==' },
        right: { type: 'BinaryExpression', operator: '!=' },
      } as LogicalExpression)
    })

    // TODO: move to BooleanExpression test
    it('should not take the precedence inside BooleanExpression', () => {
      expect(parseExpr('a == (b && c) != d')).toMatchObject({
        type: 'BinaryExpression',
        operator: '!=',
        left: {
          type: 'BinaryExpression',
          operator: '==',
          left: { name: 'a' },
          right: {
            type: 'BooleanExpression',
            body: {
              type: 'LogicalExpression',
              operator: '&&',
              left: { name: 'b' },
              right: { name: 'c' },
            },
          },
        },
        right: { name: 'd' },
      } as BinaryExpression)
    })
  })
})
