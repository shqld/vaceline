import { Parser } from '../../src/parser'
import { parseExpr } from '../../src/parser/expression/index'
import * as d from '../../src/nodes'

const parse = (source: string) => parseExpr(new Parser(source))

describe('Expression', () => {
  it('should be parsed', () => {
    parse(`{"

    "} req.http.b`)
    parse('http_status_matches(resp.status, "404") && beresp.status == "404"')
  })

  describe('ConcatExpression', () => {
    it('should be parsed', () => {
      expect(parse('"a" "b" "c"')).toMatchObject({
        type: 'ConcatExpression',
        body: [
          { type: 'StringLiteral', value: '"a"' },
          { type: 'StringLiteral', value: '"b"' },
          { type: 'StringLiteral', value: '"c"' },
        ],
      })

      expect(
        parse(`req.http.Host {"
        a
        "} true             100`)
      ).toMatchObject({
        type: 'ConcatExpression',
        body: [
          { type: 'Member' },
          { type: 'StringLiteral' },
          { type: 'BooleanLiteral' },
          { type: 'NumericLiteral' },
        ],
      })
    })
  })

  describe('FunCallExpression', () => {
    it('should be parsed', () => {
      expect(parse('http_status_matches(resp.status, "404")')).toMatchObject({
        type: 'FunCallExpression',
        callee: { type: 'Identifier', name: 'http_status_matches' },
        args: [{ type: 'Member' }, { type: 'StringLiteral' }],
      })

      expect(parse('if (req.http.a, var.b, var.c)')).toMatchObject({
        type: 'FunCallExpression',
        callee: { type: 'Identifier', name: 'if' },
        args: [{ type: 'Member' }, { type: 'Member' }, { type: 'Member' }],
      })

      //   expect(() =>
      //     parse(`
      //   if (http_status_matches(resp.status, "404") && beresp.status == "404") {
      //     set req.http.A = "Not Found";
      //   }
      // `)
      //   ).toThrowError(SyntaxError)
    })
  })

  describe('UnaryExpression', () => {
    it('should be parsed', () => {
      expect(parse('!var.isSomething')).toMatchObject({
        type: 'UnaryExpression',
        operator: '!',
        argument: {
          type: 'Member',
        },
      } as d.UnaryExpression)
    })
  })

  describe('BinaryExpression', () => {
    it('should parse', () => {
      expect(() =>
        parse(
          'req.http.isCorrect == true != true <= true ~ true && (true || true)'
        )
      ).not.toThrow()
    })

    it('should be parsed', () => {
      expect(parse('a == b')).toMatchObject({
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
      } as d.BinaryExpression)

      expect(parse('req.http.a ~ "a"')).toMatchObject({
        type: 'BinaryExpression',
      })
    })

    it('should parse nested expressions', () => {
      expect(parse('a == b != c')).toMatchObject({
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
      } as d.BinaryExpression)
    })

    it('should take the precedence over first one', () => {
      expect(parse('a == b == c')).toMatchObject({
        operator: '==',
        left: { operator: '==', left: { name: 'a' }, right: { name: 'b' } },
        right: { name: 'c' },
      } as d.BinaryExpression)
    })
  })

  describe('LogicalExpression', () => {
    it('should be parsed', () => {
      expect(parse('a && b')).toMatchObject({
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
      } as d.LogicalExpression)

      expect(parse('a || b')).toMatchObject({
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
      expect(parse('a && b && c')).toMatchObject({
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
      expect(parse('a && b && c')).toMatchObject({
        operator: '&&',
        left: {
          operator: '&&',
          left: { name: 'a' },
          right: { name: 'b' },
        },
        right: { name: 'c' },
      } as d.LogicalExpression)
    })

    it('should take the precedence over `&&`', () => {
      expect(parse('a || b && c')).toMatchObject({
        type: 'LogicalExpression',
        operator: '||',
        left: 'a',
        right: { operator: '&&', left: 'b', right: 'c' },
      } as d.LogicalExpression)
    })

    it('should take the precedence over BinaryExpression', () => {
      expect(parse('a == b && c != d')).toMatchObject({
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'BinaryExpression', operator: '==' },
        right: { type: 'BinaryExpression', operator: '!=' },
      } as d.LogicalExpression)
    })

    // TODO: move to BooleanExpression test
    it('should not take the precedence inside BooleanExpression', () => {
      expect(parse('a == (b && c) != d')).toMatchObject({
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
      } as d.BinaryExpression)
    })
  })

  describe('Member', () => {
    it('should be parsed', () => {
      expect(parse('a.b')).toMatchObject({
        type: 'Member',
        base: { type: 'Identifier', name: 'a' },
        member: { type: 'Identifier', name: 'b' },
      } as d.Member)

      expect(parse('a.b.c')).toMatchObject({
        type: 'Member',
        base: {
          type: 'Member',
          base: { type: 'Identifier', name: 'a' },
          member: { type: 'Identifier', name: 'b' },
        },
        member: { type: 'Identifier', name: 'c' },
      } as d.Member)
    })
  })

  describe('ValuePair', () => {
    it('should be parsed', () => {
      expect(parse('Cookie:Vaceline')).toMatchObject({
        type: 'ValuePair',
        base: { type: 'Identifier', name: 'Cookie' },
        name: { type: 'Identifier', name: 'Vaceline' },
      } as d.ValuePair)

      // This is actually invalid (makes no sense)
      // but apparently Fastly's Varnish doesn't throw any errors
      // so maybe it's better to throw within linting.
      // expect(() => parse('Cookie:Vaceline.invalid')).toThrow(/Unexpected token/)
    })
  })
})
