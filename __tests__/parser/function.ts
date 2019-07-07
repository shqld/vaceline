import { Parser } from '../../src/parser'

describe('Function Call', () => {
  it('should parse', () => {
    Parser.FunCallExpression.tryParse(
      'regsub(req.url, "^/failure", "/success")'
    )
    Parser.FunCallExpression.tryParse('if (req.url == "/", "root", "sub")')
    Parser.FunCallExpression.tryParse(`if(
      (
        req.http.user-agent ~ "(?i)iPhone|iPod|(Android.+Mobile)" &&
        !(req.http.user-agent ~ "(?i)iPad")
      ),
      "mobile",
      "desktop"
    )`)
    Parser.IfStatement.tryParse(`if (
        http_status_matches(resp.status, "404") && beresp.status == "404"
      ) {
        set req.http.A = "Not Found";
      }
      `)

    Parser.Program.tryParse(`
      set var.tmpUrl = regsub(req.url, "^css$", "css");
      set req.url = var.tmpUrl;
      `)
  })
})
