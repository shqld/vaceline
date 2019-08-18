import { Parser } from '../../src/parser'
import {
  AclStatement,
  LogStatement,
  BackendStatement,
  IfStatement,
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
})
