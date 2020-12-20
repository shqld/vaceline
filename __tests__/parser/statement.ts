import { Parser } from '../../src/parser'
import * as d from '../../src/nodes'
import { parseStmt } from '../../src/parser/statement/index'
import { parseIp } from '../../src/parser/statement/ip'

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
      } as d.LogStatement)

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
      } as d.AclStatement)
    })

    it('should parse Ip', () => {
      const parse = (str: string) => parseIp(new Parser(str))

      expect(parse('"localhost";')).toMatchObject({
        type: 'Ip',
        value: 'localhost',
      })
      expect(() => parse('"localhost"/16;')).toThrow(
        /invalid ip address.*A prefix length is not supported for `localhost`/
      )

      // v4
      expect(parse('"192.0.2.0";')).toMatchObject({
        type: 'Ip',
        value: '192.0.2.0',
      })
      expect(parse('"192.0.2.0"/16;')).toMatchObject({
        type: 'Ip',
        value: '192.0.2.0',
        cidr: 16,
      })
      expect(() => parse('"192.0.2.0"/33;')).toThrow(
        /IPv4 prefix length must be between 0 and 32/
      )

      // v6
      expect(parse('"2001:db8::1";')).toMatchObject({
        type: 'Ip',
        value: '2001:db8::1',
      })
      expect(parse('"2001:db8::1"/16;')).toMatchObject({
        type: 'Ip',
        value: '2001:db8::1',
        cidr: 16,
      })
      expect(() => parse('"2001:db8::1"/129;')).toThrow(
        /IPv6 prefix length must be between 0 and 128/
      )

      /* 6to4 mapping for "192.0.2.4" */
      expect(parse('"2002:c000:0204::";')).toMatchObject({
        type: 'Ip',
        value: '2002:c000:0204::',
      })
      expect(parse('"::FFFF:192.0.2.4";')).toMatchObject({
        type: 'Ip',
        value: '::FFFF:192.0.2.4',
      })
      expect(parse('"::1";')).toMatchObject({
        type: 'Ip',
        value: '::1',
      })

      /* unspecified address */
      expect(parse('"::";')).toMatchObject({
        type: 'Ip',
        value: '::',
      })

      expect(() => parse('"0.0.0";')).toThrow(/invalid ip address/)
      expect(() => parse('"invalid";')).toThrow(/invalid ip address/)
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
      } as d.BackendStatement)
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
      } as d.IfStatement)
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
      } as d.ImportStatement)
    })

    it('should not parse `import` with string literal', () => {
      expect(() =>
        parse(`
import "module";
    `)
      ).toThrow(/expected Identifier/)
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
      } as d.ReturnStatement)
    })

    it('should parse also without parens', () => {
      expect(
        parse(`
        return pass;
      `)
      ).toMatchObject({
        type: 'ReturnStatement',
        action: 'pass',
      } as d.ReturnStatement)
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
      } as d.ErrorStatement)
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
      } as d.ErrorStatement)
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
      } as d.RestartStatement)
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
      } as d.SyntheticStatement)
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
      } as d.SyntheticStatement)
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
      } as d.TableStatement)
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
      } as d.TableStatement)
    })
  })
})
