import { wrap as wrapRaw } from 'jest-snapshot-serializer-raw'
import { testdocs } from '../../__tests__/helpers/snapshot'
import { generate } from '../../src/lib'
import { Tokenizer } from '../../src/parser/tokenizer'

for (const testdoc of testdocs) {
  for (const testcase of testdoc.basic) {
    describe(`(${testdoc.name})`, () => {
      const ast = testdoc.parse.call(testdoc.parse, testcase.code)
      const { code } = generate(ast)

      it(testcase.name, () => {
        if (
          testdoc.name === 'BinaryExpression' &&
          testcase.name === 'multiple'
        ) {
          // no test because of parens auto insertion
          return
        }

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

      const formatted = {
        long: generate(ast, { printWidth: Infinity }).code,
        short: generate(ast, { printWidth: 0 }).code,
      }

      if (formatted.short === formatted.long) {
        it('format', () => {
          expect(wrap(testcase.code, formatted.long)).toMatchSnapshot()
        })
      } else {
        it('format<long>', () => {
          expect(wrap(testcase.code, formatted.long)).toMatchSnapshot()
        })

        it('format<short>', () => {
          expect(wrap(testcase.code, formatted.short)).toMatchSnapshot()
        })
      }
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
