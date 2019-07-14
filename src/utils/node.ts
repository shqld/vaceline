import { Node } from '../nodes/node'
import { NodeType, NodeAs } from '../nodes/node-def'

export const isNode = <T extends Array<NodeType>>(
  node: Node,
  types: T
): node is NodeAs<T[number]> => types.includes(node.type as any)
