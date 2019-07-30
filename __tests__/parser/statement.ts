import { Parser } from '../../src/parser'
import { AclStatement, LogStatement } from '../../src/ast-nodes'

// @ts-ignore private method
const parseStmt = (source: string) => new Parser(source).parseStmt()

describe('Parser.parseStmt', () => {
  it('should parse LogStatement', () => {
    expect(parseStmt('log {"a"} req.http.b;')).toMatchObject({
      type: 'LogStatement',
      content: {
        type: 'ConcatExpression',
        body: [{ type: 'StringLiteral' }, { type: 'Identifier' }],
      },
    } as LogStatement)

    expect(
      parseStmt(`
    log {"a: "} if(req.http.b, "b", "c")
      if(req.http.b, "b", "c")
      regsuball(req.http.X-Forwarded-Host, {"	"}, "");
    `)
    ).toMatchObject({ type: 'LogStatement' })
  })

  it('should parse AclStatement', () => {
    expect(parseStmt('acl my_acls { "138.101.0.0"/16; }')).toMatchObject({
      type: 'AclStatement',
      id: { type: 'Identifier', name: 'my_acls' },
      body: [{ type: 'IpLiteral', value: '"138.101.0.0"/16' }],
    } as AclStatement)
  })
})
