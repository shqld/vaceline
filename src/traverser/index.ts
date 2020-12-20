import { Node } from '../nodes'
import { NodePath, TraversalContext, Handler } from './path'

export const traverseNode = (
  node: Node,
  callback: (path: NodePath, context: TraversalContext) => void,
  context: TraversalContext = {
    parent: null,
    parentPath: null,
    inList: false,
    state: null,
  }
): void => {
  const path = new NodePath(node, context)

  // If sobroutine, ..., then set `inList` true

  callback(path, context)

  const nextNodes = node.next()

  for (const nextNode of nextNodes) {
    traverseNode(nextNode, callback, {
      ...context,
      parent: node,
      parentPath: path,
    })
  }
}

export const traverse = (
  ast: Node,
  handler: Handler,
  context: TraversalContext = {
    parent: null,
    parentPath: null,
    inList: false,
    state: null,
  }
): void => {
  const handle = (path: NodePath, context: TraversalContext) => {
    if (handler.entry) {
      handler.entry.call(context.state, path)
    }
  }

  traverseNode(ast, handle, context)
}

// Create traversal path array recursively
export const createPathArray = (
  ast: Node,
  context: TraversalContext = {
    parent: null,
    parentPath: null,
    inList: false,
    state: null,
  }
): Array<NodePath> => {
  const paths: Array<NodePath> = []
  const appendPath = (path: NodePath) => paths.push(path)

  traverseNode(ast, appendPath, context)

  return paths
}
