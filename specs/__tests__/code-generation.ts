import { wrap as wrapRaw } from 'jest-snapshot-serializer-raw'
import { testdocs } from '../../__tests__/helpers/snapshot'
import { generate } from '../../src/lib'
import { Tokenizer } from '../../src/parser/tokenizer'

for (const testdoc of testdocs) {
  for (const testcase of testdoc.basic) {
    describe(`(${testdoc.name})`, () => {
      const { ast, comments } = testdoc.parse.call(testdoc.parse, testcase.code)
      const { code } = generate(ast, { comments })

      it(testcase.name, () => {
        const output = new Tokenizer(code)
          .tokenize()
          .filter((token) => {
            if (
              testdoc.name === 'BinaryExpression' ||
              testdoc.name === 'LogicalExpression'
            ) {
              // strip parens auto-inserted
              return token.value !== '(' && token.value !== ')'
            }

            return true
          })
          .map((token) => token.value)

        const input = new Tokenizer(testcase.code)
          .tokenize()
          .filter((token) => token.type !== 'comment')
          .map((token) => token.value)

        expect(output).toStrictEqual(input)
      })

      const formatted = {
        long: generate(ast, { comments, printWidth: Infinity }).code,
        short: generate(ast, { comments, printWidth: 0 }).code,
      }

      if (formatted.short === formatted.long) {
        it('format ' + testcase.name, () => {
          expect(wrap(testcase.code, formatted.long)).toMatchSnapshot()
        })
      } else {
        it('format<long> ' + testcase.name, () => {
          expect(wrap(testcase.code, formatted.long)).toMatchSnapshot()
        })

        it('format<short> ' + testcase.name, () => {
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
