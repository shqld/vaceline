import { Node } from '../nodes'
import { NodePath, TraversalContext, Handler } from './path'

export const traverse = (
  node: Node,
  handler: Handler,
  context: TraversalContext = {
    parent: null,
    parentPath: null,
    inList: false,
    state: null,
  }
): void => {
  const path = NodePath.create(node, context)

  if (handler.entry) {
    handler.entry.call(context.state, path)
  }

  const next = node.next()

  if (!next) return

  next.forEach((nextNode) => {
    if (Array.isArray(nextNode)) {
      return nextNode.forEach((n, i) =>
        traverse(n, handler, {
          ...context,
          parent: node,
          parentPath: path,
          inList: true,
          key: i,
        })
      )
    }

    return traverse(nextNode, handler, {
      ...context,
      parent: node,
      parentPath: path,
      inList: false,
    })
  })
}
