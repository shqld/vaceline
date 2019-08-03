import { Parser } from '../../src/parser'
import { parseExpr } from '../../src/parser/expression'
import { BinaryExpression, LogicalExpression } from '../../src/ast-nodes'
import { parseIp } from '../../src/parser/statement/ip'

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
      expect(parse('http_status_matches(resp.status, "404")')).toMatchObject({
        type: 'FunCallExpression',
        callee: { type: 'Identifier', name: 'http_status_matches' },
        arguments: [{ type: 'Identifier' }, { type: 'StringLiteral' }],
      })

      expect(parse('if (req.http.b, a, b)')).toMatchObject({
        type: 'FunCallExpression',
        callee: { type: 'Identifier', name: 'if' },
        arguments: [
          { type: 'Identifier' },
          { type: 'Identifier' },
          { type: 'Identifier' },
        ],
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
      } as BinaryExpression)

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
      } as BinaryExpression)
    })

    it('should take the precedence over first one', () => {
      expect(parse('a == b == c')).toMatchObject({
        left: { left: { name: 'a' }, right: { name: 'b' } },
        right: { name: 'c' },
      } as BinaryExpression)
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
      } as LogicalExpression)

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
        left: { left: { name: 'a' }, right: { name: 'b' } },
        right: { name: 'c' },
      } as LogicalExpression)
    })

    it('should take the precedence over `&&`', () => {
      expect(parse('a || b && c')).toMatchObject({
        type: 'LogicalExpression',
        operator: '||',
        right: { operator: '&&' },
      } as LogicalExpression)
    })

    it('should take the precedence over BinaryExpression', () => {
      expect(parse('a == b && c != d')).toMatchObject({
        type: 'LogicalExpression',
        operator: '&&',
        left: { type: 'BinaryExpression', operator: '==' },
        right: { type: 'BinaryExpression', operator: '!=' },
      } as LogicalExpression)
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
      } as BinaryExpression)
    })
  })

  describe('Ip', () => {
    const parse = (str: string) => parseIp(new Parser(str))

    it('should parse', () => {
      expect(parse('"localhost"')).toMatchObject({
        type: 'Ip',
        value: 'localhost',
      })
      expect(() => parse('"localhost"/16')).toThrow(
        /invalid ip address.*A prefix length is not supported for `localhost`/
      )

      // v4
      expect(parse('"192.0.2.0"')).toMatchObject({
        type: 'Ip',
        value: '192.0.2.0',
      })
      expect(parse('"192.0.2.0"/16')).toMatchObject({
        type: 'Ip',
        value: '192.0.2.0',
        cidr: 16,
      })
      expect(() => parse('"192.0.2.0"/33')).toThrow(
        /IPv4 prefix length must be between 0 and 32/
      )

      // v6
      expect(parse('"2001:db8::1"')).toMatchObject({
        type: 'Ip',
        value: '2001:db8::1',
      })
      expect(parse('"2001:db8::1"/16')).toMatchObject({
        type: 'Ip',
        value: '2001:db8::1',
        cidr: 16,
      })
      expect(() => parse('"2001:db8::1"/129')).toThrow(
        /IPv6 prefix length must be between 0 and 128/
      )

      /* 6to4 mapping for "192.0.2.4" */
      expect(parse('"2002:c000:0204::"')).toMatchObject({
        type: 'Ip',
        value: '2002:c000:0204::',
      })
      expect(parse('"::FFFF:192.0.2.4"')).toMatchObject({
        type: 'Ip',
        value: '::FFFF:192.0.2.4',
      })
      expect(parse('"::1"')).toMatchObject({
        type: 'Ip',
        value: '::1',
      })

      /* unspecified address */
      expect(parse('"::"')).toMatchObject({
        type: 'Ip',
        value: '::',
      })

      expect(() => parse('"0.0.0"')).toThrow(/invalid ip address/)
      expect(() => parse('"invalid"')).toThrow(/invalid ip address/)
    })
  })
})
