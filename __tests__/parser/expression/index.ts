import { Parser } from '../../../src/parser'

describe('Expression', () => {
  it('should be parsed', () => {
    Parser.expression.tryParse(`{"
    
    
    "} req.http.b`)
    Parser.expression.tryParse('http_status_matches(resp.status, "404") && beresp.status == "404"')
  })

  describe('ConcatExpression', () => {
    it('should be parsed', () => {
      Parser.ConcatExpression.tryParse('"a" "b" "c"')
      const node = Parser.ConcatExpression.tryParse(`req.http.Host {"
      a
      "} true 100s            100`)

      expect(node.body).toHaveLength(5)
      node.body.slice(1).forEach((b: any) => expect(b.type.endsWith('Literal')).toBeTruthy())
    })
  })

  describe('FunCallExpression', () => {
    it('should be parsed', () => {
      {
        const node: any = Parser.FunCallExpression.tryParse(
          'http_status_matches(resp.status, "404")'
        )
        expect(node.callee).toHaveProperty('type', 'Identifier')
        expect(node.callee.name).toBe('http_status_matches')
        expect(node.arguments).toHaveLength(2)
      }
      {
        const node: any = Parser.FunCallExpression.tryParse('if (req.http.b, a, b)')
        expect(node.callee).toHaveProperty('type', 'Identifier')
        expect(node.callee.name).toBe('if')
        expect(node.arguments).toHaveLength(3)
      }
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
      {
        const node = Parser.BinaryExpression.tryParse('req.http.a == "a"')
        expect(node).toHaveProperty('type', 'BinaryExpression')
      }
      {
        const node = Parser.BinaryExpression.tryParse('req.http.a ~ "a"')
        expect(node).toHaveProperty('type', 'BinaryExpression')
      }
    })

    it('should parse nested expressions', () => {
      {
        const node = Parser.BinaryExpression.tryParse('req.http.a == "a" != "b"')
        expect(node).toHaveProperty('type', 'BinaryExpression')
      }
    })
  })

  describe('LogicalExpression', () => {
    it('should be parsed', () => {
      {
        const node = Parser.LogicalExpression.tryParse('req.http.a && req.http.b')

        expect(node).toHaveProperty('type', 'LogicalExpression')
      }
      {
        const node = Parser.LogicalExpression.tryParse('req.http.a || req.http.b')

        expect(node).toHaveProperty('type', 'LogicalExpression')
      }
    })

    it('should parse nested expressions', () => {
      const node = Parser.LogicalExpression.tryParse('req.http.a && req.http.b || req.http.c')

      expect(node).toHaveProperty('type', 'LogicalExpression')
    })

    it('should take the precedence over BinaryExpression', () => {
      // Don't test with `p.alt(Parser.LogicalExpression, Parser.BinaryExpression)`
      // because each parser has the right order to be declared
      // To test that as well, always use an abstract Parser e.g. `literal`, `expression`, `statement`...
      const node = Parser.expression.tryParse('req.http.a == "a" && req.http.b != "c"')

      expect(node).toHaveProperty('operator', '&&')

      expect(node).toHaveProperty('left.type', 'BinaryExpression')
      expect(node).toHaveProperty('right.type', 'BinaryExpression')

      expect(node).toHaveProperty('left.operator', '==')
      expect(node).toHaveProperty('right.operator', '!=')
    })

    // TODO: move to BooleanExpression test
    it('should not take the precedence', () => {
      const node = Parser.expression.tryParse('req.http.a == ("a" && req.http.b) != "c"')

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
