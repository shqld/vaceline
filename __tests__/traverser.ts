import fs from 'fs'
import path from 'path'

import { traverse } from '../src/traverser'
import { parse } from '../src'
import { Node, NodeType } from '../src/nodes'
import { NodePath } from '../src/traverser/path'
import { Identifier } from '../src/ast-nodes'

const checkNode = (node: any, type: NodeType) => {
  expect(node).toBeInstanceOf(Node)
  expect(node.type).toBe(type)
}

describe('Traverser', () => {
  const code = fs.readFileSync(
    path.resolve('__tests__/__fixture__/test.vcl'),
    'utf8'
  )
  const ast = parse(code)

  // it('should traverse every node', () => {})
  it('should traverse entry', () => {
    let node: Identifier

    traverse(ast, {
      entry(path: NodePath<any>) {
        if (path.isIdentifier({ name: 'specialUser' })) {
          node = path.node
        }
      },
    })

    checkNode(node!, 'Identifier')
    expect(node!.name).toBe('specialUser')
  })

  describe('Path', () => {
    const paths: Array<NodePath<any>> = []

    traverse(ast, {
      entry(path: NodePath<any>) {
        paths.push(path)
      },
    })

    it("shouldn't have `parent` & `parentPath` in the top node", () => {
      const path = paths[0]

      expect(path).toBeInstanceOf(NodePath)
      expect(path.parent).toBeNull()
    })

    it('should have `parent` & `parentPath`', () => {
      const path = paths[paths.length - 1]

      expect(path).toBeInstanceOf(NodePath)
      expect(path.parent).toBeInstanceOf(Node)
      expect(path.parentPath).toBeInstanceOf(NodePath)
    })
  })
})
