import { Parser } from '../../src/parser'
import {
  AclStatement,
  LogStatement,
  BackendStatement,
  IfStatement,
  ImportStatement,
  ReturnStatement,
  ErrorStatement,
  RestartStatement,
  SyntheticStatement,
  TableStatement,
} from '../../src/ast-nodes'
import { parseStmt } from '../../src/parser/statement/index'

const parse = (source: string) => parseStmt(new Parser(source.trim()))

describe('parseStatement', () => {
  describe('LogStatement', () => {
    it('should parse', () => {
      expect(parse('log {"a"} req.http.b;')).toMatchObject({
        type: 'LogStatement',
        content: {
          type: 'ConcatExpression',
          body: [{ type: 'StringLiteral' }, { type: 'Member' }],
        },
      } as LogStatement)

      expect(
        parse(`
log
  {"a: "}
  if(req.http.b, "b", "c")
  regsuball(req.http.X-Forwarded-Host, {"	"}, "");
    `)
      ).toMatchObject({ type: 'LogStatement' })
    })
  })

  describe('AclStatement', () => {
    it('should parse', () => {
      expect(
        parse(
          `
acl my_acls {
  "138.101.0.0"/16;
  "138.101.0.0"/16;
  "138.101.0.0"/16;
}
        `.trim()
        )
      ).toMatchObject({
        type: 'AclStatement',
        id: { type: 'Identifier', name: 'my_acls' },
        body: [
          { type: 'Ip', loc: { start: { line: 2 } } },
          { type: 'Ip', loc: { start: { line: 3 } } },
          { type: 'Ip', loc: { start: { line: 4 } } },
        ],
        loc: { start: { line: 1 }, end: { line: 5 } },
      } as AclStatement)
    })
  })

  describe('BackendStatement', () => {
    it('should parse', () => {
      expect(
        parse(
          `
backend my_backend {
  .connect_timeout = 5s;
  .host = "example.com";
  .ssl = true;
  .probe = {
    .request = "GET /probe HTTP/1.1" "Host: example.com";
    .timeout = 5s;
  }
}
`.trim()
        )
      ).toMatchObject({
        type: 'BackendStatement',
        body: [
          {
            key: 'connect_timeout',
            value: { type: 'DurationLiteral', value: '5s' },
          },
          {
            key: 'host',
            value: { type: 'StringLiteral', value: '"example.com"' },
          },
          {
            key: 'ssl',
            value: { type: 'BooleanLiteral', value: 'true' },
          },
          {
            key: 'probe',
            value: [
              {
                key: 'request',
                value: {
                  type: 'ConcatExpression',
                  body: [{ type: 'StringLiteral' }, { type: 'StringLiteral' }],
                },
              },
              {
                key: 'timeout',
                value: { type: 'DurationLiteral', value: '5s' },
              },
            ],
          },
        ],
      } as BackendStatement)
    })
  })

  describe('IfStatement', () => {
    it('should parse', () => {
      expect(
        parse(`
if (true) {
  a;
} else if (true) {
  b;
} elsif (true) {
  c;
} elseif (true) {
  d;
} else {
  e;
}
    `)
      ).toMatchObject({
        type: 'IfStatement',
        test: { type: 'BooleanLiteral' },
        consequent: [
          {
            type: 'ExpressionStatement',
            body: { type: 'Identifier', name: 'a' },
          },
        ],
        alternative: {
          type: 'IfStatement',
          alternative: {
            type: 'IfStatement',
            alternative: {
              type: 'IfStatement',
              alternative: [
                {
                  type: 'ExpressionStatement',
                  body: { type: 'Identifier', name: 'e' },
                },
              ],
            },
          },
        },
      } as IfStatement)
    })
  })

  describe('ImportStatement', () => {
    it('should parse', () => {
      expect(
        parse(`
import module;
      `)
      ).toMatchObject({
        type: 'ImportStatement',
        module: {
          type: 'Identifier',
          name: 'module',
        },
      } as ImportStatement)
    })

    it('should not parse `import` with string literal', () => {
      expect(() =>
        parse(`
import "module";
    `)
      ).toThrow(/Only identifier is valid for import/)
    })
  })

  describe('ReturnStatement', () => {
    it('should parse', () => {
      expect(
        parse(`
        return (pass);
      `)
      ).toMatchObject({
        type: 'ReturnStatement',
        action: 'pass',
      } as ReturnStatement)
    })

    it('should parse also without parens', () => {
      expect(
        parse(`
        return pass;
      `)
      ).toMatchObject({
        type: 'ReturnStatement',
        action: 'pass',
      } as ReturnStatement)
    })

    it('should not parse with invalid action arg', () => {
      expect(() =>
        parse(`
        return invalid_action;
      `)
      ).toThrow(/return action should be one of/)
    })
  })

  describe('ErrorStatement', () => {
    it('should parse', () => {
      expect(
        parse(`
        error 700;
      `)
      ).toMatchObject({
        type: 'ErrorStatement',
        status: 700,
      } as ErrorStatement)
    })

    it('should parse with error message', () => {
      expect(
        parse(`
        error 700 "Special Error";
      `)
      ).toMatchObject({
        type: 'ErrorStatement',
        status: 700,
        message: {
          type: 'StringLiteral',
          value: '"Special Error"',
        },
      } as ErrorStatement)
    })
  })

  describe('RestartStatement', () => {
    it('should parse', () => {
      expect(
        parse(`
        restart;
      `)
      ).toMatchObject({
        type: 'RestartStatement',
      } as RestartStatement)
    })

    it('should not parse with argment', () => {
      expect(() =>
        parse(`
        restart 1;
      `)
      ).toThrow(/expected symbol.*;/)
    })
  })

  describe('SyntheticStatement', () => {
    it('should parse', () => {
      expect(
        parse(`
        synthetic "response";
      `)
      ).toMatchObject({
        type: 'SyntheticStatement',
        response: {
          type: 'StringLiteral',
          value: '"response"',
        },
      } as SyntheticStatement)
    })

    it('should parse with ConcatExpression', () => {
      expect(
        parse(`
        synthetic "{ \"id\": \"" req.http.id "\" }";
      `)
      ).toMatchObject({
        type: 'SyntheticStatement',
        response: {
          type: 'ConcatExpression',
        },
      } as SyntheticStatement)
    })

    it('should not parse with argment', () => {
      expect(() =>
        parse(`
        synthetic;
      `)
      ).toThrow() // TODO: /no response argument/
    })
  })

  describe('TableStatement', () => {
    it('should parse', () => {
      expect(
        parse(`
        table my_table {
          "key": "value",
          "key": "value"
        };
      `)
      ).toMatchObject({
        type: 'TableStatement',
        id: {
          type: 'Identifier',
          name: 'my_table',
        },
        body: [
          {
            key: '"key"',
            value: '"value"',
          },
          {
            key: '"key"',
            value: '"value"',
          },
        ],
      } as TableStatement)
    })

    it('should parse with trailing comma of last value', () => {
      expect(
        parse(`
        table my_table {
          "key": "value",
        };
      `)
      ).toMatchObject({
        type: 'TableStatement',
      } as TableStatement)
    })
  })
})
