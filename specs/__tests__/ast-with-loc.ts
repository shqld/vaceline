import { testdocs } from '../../__tests__/helpers/snapshot'

for (const testdoc of testdocs) {
  for (const testcase of testdoc.basic) {
    describe(`(${testdoc.name})`, () => {
      it(testcase.name, () => {
        const ast = testdoc.parse.call(testdoc.parse, testcase.code)
        // console.time(id)

        expect(ast).toMatchSnapshot(testcase.name)

        // console.timeEnd(id)
      })
    })
  }
}
