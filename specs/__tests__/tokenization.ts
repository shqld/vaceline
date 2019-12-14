import { testdocs } from '../../__tests__/helpers/snapshot'
import { Tokenizer, Token } from '../../src/parser/tokenizer'

for (const testdoc of testdocs) {
  for (const testcase of testdoc.basic) {
    const tokens: Array<Token> = new Tokenizer(testcase.code).tokenize()

    describe(`(${testdoc.name})`, () => {
      it(testcase.name, () => {
        expect(tokens.map(({ loc, ...token }) => token)).toMatchSnapshot()
      })

      it('<loc>' + testcase.name, () => {
        expect(
          tokens.map((token) => ({ type: token.type, loc: token.loc }))
        ).toMatchSnapshot()
      })
    })
  }
}
