/* eslint-disable @typescript-eslint/no-non-null-assertion */
import fs from 'fs'
import path from 'path'
import { Identifier } from '@vaceline/types'
import { parse} from '@vaceline/parser'
import { traverse, createPathArray } from '../src'
import { NodePath } from '../src/path'

describe('Traverser', () => {
  const codePath = path.resolve('__tests__/__fixture__/rough.vcl')
  const code = fs.readFileSync(codePath, 'utf8')
  const ast = parse(code)

  // it('should traverse every node', () => {})
  it('should traverse entry', () => {
    let node: Identifier

    traverse(ast, {
      entry(path: NodePath) {
        if (path.node.type === 'Identifier') {
          node = path.node
        }
      },
    })

    expect(node!.type).toStrictEqual('Identifier')
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
      expect(typeof path.parent?.type).toBe('string')
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
