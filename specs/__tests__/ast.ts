import { testdocs } from '../../__tests__/helpers/snapshot'
import { traverse } from '../../src/lib'

for (const testdoc of testdocs) {
  for (const testcase of testdoc.basic) {
    describe(`(${testdoc.name})`, () => {
      it(testcase.name, () => {
        const { ast } = testdoc.parse.call(testdoc.parse, testcase.code)

        traverse(ast, {
          entry({ node }) {
            delete node.loc
          },
        })

        expect(ast).toMatchSnapshot()
      })
    })
  }
}

//   it('should match performance snapshot', () => {
//     let i = 10
//     const results = []

//     const start = Number(new Date())

//     while (i--) {
//       let operations = 0

//       while (Number(new Date()) - start < 300) {
//         testdoc.parse.call(testdoc.parse, testcase.code)
//         operations++
//       }

//       results.push(operations)
//     }

//     const result = results.reduce((acc, r) => acc + r, 0) / results.length

//     expect(result).toMatchSnapshot(id)
//   })
