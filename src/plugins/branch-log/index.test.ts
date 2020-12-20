import { parse, traverse, generate } from '../../lib'
import BranchLogPlugin from '.'
import { NodePath } from '../../traverser/path'
import * as d from '../../nodes'

const code = `

sub vcl_recv {
  if (true) {
    set req.http.Test = 1;
  } else if (false) {
    set req.http.Test = 1;
  } else {
    set req.http.Test = 1;
  }
}

sub my_function {
  set req.http.Test = 1;
}

sub vcl_deliver {
  call my_function;

  set req.http.Test = 1;
}

`.trim()

describe('BranchLogPlugin', () => {
  const ast = parse(code)

  it('should create Branch-Log nodes inside each branch', () => {
    BranchLogPlugin(ast)

    traverse(ast, {
      entry({ node }: NodePath<d.SubroutineStatement | d.IfStatement>) {
        if (node instanceof d.SubroutineStatement) {
          if (node.id.name === 'vcl_recv') {
            const loggerNode = node.body[0]

            expect(generate(loggerNode).code).toMatch(
              /set req\.http\.Vaceline-Branch-Log = "\(vcl_recv\).*";/
            )
          } else {
            const loggerNode = node.body[0]

            expect(loggerNode).toMatchObject({
              type: 'AddStatement',
              left: { member: { name: 'Vaceline-Branch-Log' } },
            } as d.AddStatement)

            expect(generate(loggerNode).code).toMatch(
              /add req\.http\.Vaceline-Branch-Log = "\(.*\).*";/
            )
          }

          if (node.id.name === 'vcl_deliver') {
            const [stdCollect, reqToResp] = node.body.slice(-2)

            expect(generate(stdCollect).code).toMatch(
              'std.collect(req.http.Vaceline-Branch-Log);'
            )
            expect(generate(reqToResp).code).toMatch(
              'set resp.http.Vaceline-Branch-Log = req.http.Vaceline-Branch-Log;'
            )
          }
        } else if (node instanceof d.IfStatement) {
          const loggerNode = node.consequent[0]

          expect(generate(loggerNode).code).toMatch(
            /add req\.http\.Vaceline-Branch-Log = "\(anonymous\).*";/
          )
        }
      },
    })
  })
})
