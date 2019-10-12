import { Node, nodeDefs, NodeType, NodeDef } from '../nodes'
import { NodePath, TraversalContext, Handler } from './path'
import { assert } from '../utils/assert'

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

  const def: NodeDef<any> = nodeDefs[node.type as NodeType]
  assert(!!def, `${JSON.stringify(node, null, 2)} is not valid Node`)

  assert(!!def.next, `${node.type} is not found in node defs`)
  const next = def.next(node)

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
