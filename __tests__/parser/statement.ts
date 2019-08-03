import { Parser } from '../../src/parser'
import { AclStatement, LogStatement } from '../../src/ast-nodes'
import { parseStmt } from '../../src/parser/statement'

const parse = (source: string) => parseStmt(new Parser(source))

describe('Parser.parse', () => {
  it('should parse LogStatement', () => {
    expect(parse('log {"a"} req.http.b;')).toMatchObject({
      type: 'LogStatement',
      content: {
        type: 'ConcatExpression',
        body: [{ type: 'StringLiteral' }, { type: 'Identifier' }],
      },
    } as LogStatement)

    expect(
      parse(`
    log {"a: "} if(req.http.b, "b", "c")
      if(req.http.b, "b", "c")
      regsuball(req.http.X-Forwarded-Host, {"	"}, "");
    `)
    ).toMatchObject({ type: 'LogStatement' })
  })

  it('should parse AclStatement', () => {
    expect(parse('acl my_acls { "138.101.0.0"/16; }')).toMatchObject({
      type: 'AclStatement',
      id: { type: 'Identifier', name: 'my_acls' },
      body: [{ type: 'IpLiteral', value: '"138.101.0.0"/16' }],
    } as AclStatement)
  })
})
