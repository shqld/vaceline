import fs from 'fs'
import path from 'path'

import { traverse } from '../src/traverser'
import { parse } from '../src'
import { Identifier, Node, MemberExpression } from '../src/nodes'
import { NodePath } from '../src/traverser/path'

describe('Traverser', () => {
  const code = fs.readFileSync(
    path.resolve('__tests__/__fixture__/test.vcl'),
    'utf8'
  )
  const ast = Parser.Program.tryParse(code)

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

    expect(node!).toBeInstanceOf(Identifier)
    expect(node!.name).toBe('specialUser')
  })

  describe('Path', () => {
    const paths: Array<NodePath<any>> = []

    traverse(ast, {
      entry(path: NodePath<any>) {
        paths.push(path)
      },
    })

    it('should `get` child node as NodePath', () => {
      const path = paths[paths.length - 8]

      expect(path.node).toBeInstanceOf(MemberExpression)

      expect(path.get('object')).toBeInstanceOf(NodePath)
      expect(path.get('object').node).toBe(path.node.object)

      expect(path.get('property')).toBeInstanceOf(NodePath)
      expect(path.get('property').node).toBe(path.node.property)
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
