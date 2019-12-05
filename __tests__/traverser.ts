import fs from 'fs'
import path from 'path'
import { traverse, createPathArray } from '../src/traverser'
import { parse } from '../src'
import { Identifier, BaseNode } from '../src/nodes'
import { NodePath } from '../src/traverser/path'

describe('Traverser', () => {
  const codePath = path.resolve('__tests__/__fixture__/rough.vcl')
  const code = fs.readFileSync(codePath, 'utf8')
  const ast = parse(code)

  // it('should traverse every node', () => {})
  it('should traverse entry', () => {
    let node: Identifier

    traverse(ast, {
      entry(path: NodePath) {
        if (path.node instanceof Identifier) {
          node = path.node
        }
      },
    })

    expect(node!).toBeInstanceOf(Identifier)
  })

  describe('Path', () => {
    const paths = createPathArray(ast)

    it("shouldn't have `parent` & `parentPath` in the top node", () => {
      const path = paths[0]

      expect(path).toBeInstanceOf(NodePath)
      expect(path.parent).toBeNull()
    })

    it('should have `parent` & `parentPath`', () => {
      const path = paths[paths.length - 1]

      expect(path).toBeInstanceOf(NodePath)
      expect(path.parent).toBeInstanceOf(BaseNode)
      expect(path.parentPath).toBeInstanceOf(NodePath)
    })

    it('should match traversed results', () => {
      const traversalResults: Array<NodePath> = []

      traverse(ast, {
        entry(path: NodePath) {
          traversalResults.push(path)
        },
      })

      expect(paths).toMatchObject(traversalResults)
    })
  })
})
