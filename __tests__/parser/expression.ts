import { Parser } from '../../src/parser'

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
    // it('should parse', () => {
    //   expect(() =>
    //     OperatorExpression.tryParse(
    //       'req.http.isCorrect == true != true <= true ~ true && (true || true)'
    //     )
    //   ).not.toThrow()
    // })

    it('should be parsed', () => {
      expect(parseExpr('req.http.a == "a"')).toMatchObject({
        type: 'BinaryExpression',
      })
      expect(parseExpr('req.http.a ~ "a"')).toMatchObject({
        type: 'BinaryExpression',
      })
    })

    it('should parse nested expressions', () => {
      {
        expect(parseExpr('req.http.a == "a" != "b"')).toMatchObject({
          type: 'BinaryExpression',
        })
      }
    })
  })

  describe('LogicalExpression', () => {
    it('should be parsed', () => {
      expect(parseExpr('req.http.a && req.http.b')).toMatchObject({
        type: 'LogicalExpression',
      })
      expect(parseExpr('req.http.a || req.http.b')).toMatchObject({
        type: 'LogicalExpression',
      })
    })

    it('should parse nested expressions', () => {
      expect(parseExpr('req.http.a && req.http.b || req.http.c')).toMatchObject(
        {
          type: 'LogicalExpression',
        }
      )
    })

    it('should take the precedence over BinaryExpression', () => {
      // Don't test with `p.alt(Parser.LogicalExpression, Parser.BinaryExpression)`
      // because each parser has the right order to be declared
      // To test that as well, always use an abstract Parser e.g. `literal`, `expression`, `statement`...
      const node = parseExpr('req.http.a == "a" && req.http.b != "c"')

      expect(node).toHaveProperty('operator', '&&')

      expect(node).toHaveProperty('left.type', 'BinaryExpression')
      expect(node).toHaveProperty('right.type', 'BinaryExpression')

      expect(node).toHaveProperty('left.operator', '==')
      expect(node).toHaveProperty('right.operator', '!=')
    })

    // TODO: move to BooleanExpression test
    it('should not take the precedence', () => {
      const node = parseExpr('req.http.a == ("a" && req.http.b) != "c"')

      expect(node).toHaveProperty('operator', '!=')

      expect(node).toHaveProperty('left.type', 'BinaryExpression')
      expect(node).toHaveProperty('right.type', 'StringLiteral')

      expect(node).toHaveProperty('left.operator', '==')
      expect(node).toHaveProperty('left.right.type', 'BooleanExpression')

      expect(node).toHaveProperty('left.right.body.type', 'LogicalExpression')
      expect(node).toHaveProperty('left.right.body.operator', '&&')

      expect(node).toHaveProperty('left.right.body.left.value', 'a')
    })
  })
})
