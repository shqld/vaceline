import { Parser } from '../../src/parser'

describe('Function Call', () => {
  it('should parse', () => {
    Parser.LogStatement.tryParse('log {"a"} req.http.b;')
    Parser.LogStatement.tryParse(`log {"a: "} if(req.http.b, "b", "c")
    if(req.http.b, "b", "c")
    regsuball(req.http.X-Forwarded-Host, {"	"}, "");
    `)
  })
})
