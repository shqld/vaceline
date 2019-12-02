import { wrap as wrapRaw } from 'jest-snapshot-serializer-raw'
import { testdocs } from './helpers/snapshot'
import { generate } from '../src/lib'
import { Tokenizer } from '../src/parser/tokenizer'

for (const testdoc of testdocs) {
  for (const testcase of testdoc.basic) {
    describe(`(${testdoc.name})`, () => {
      const ast = testdoc.parse.call(testdoc.parse, testcase.code)
      const { code } = generate(ast)

      it(testcase.name, () => {
        const output = new Tokenizer(code)
          .tokenize()
          .filter((token) => token.type !== 'comment')
          .map((token) => token.value)

        const input = new Tokenizer(testcase.code)
          .tokenize()
          .filter((token) => token.type !== 'comment')
          .map((token) => token.value)

        expect(output).toStrictEqual(input)
      })

      it('format', () => {
        expect(wrap(testcase.code, code)).toMatchSnapshot()
      })
    })
  }
}

const wrap = (input: string, output: string) =>
  wrapRaw(
    `
---------- (input) ---------------------------------------------------------------
${input}

---------- (output) --------------------------------------------------------------
${output}

`.trim()
  )
