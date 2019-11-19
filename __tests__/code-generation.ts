import { wrap } from 'jest-snapshot-serializer-raw'
import { testdocs } from './helpers/snapshot'
import { generate } from '../src'

for (const testdoc of testdocs) {
  for (const testcase of testdoc.basic) {
    describe(`(${testdoc.name})`, () => {
      it(testcase.name, () => {
        const ast = testdoc.parse.call(testdoc.parse, testcase.code)
        const { code } = generate(ast)

        expect(wrap(code)).toMatchSnapshot()
      })
    })
  }
}
