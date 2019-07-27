import { Node, Location } from './node'
import { NodeDefMap, nodeDefs, ExtractNodeFromDef } from './node-def'

export const createNode = <
  T extends keyof NodeDefMap,
  D extends NodeDefMap[T],
  N extends ExtractNodeFromDef<D>,
  V extends Omit<N, keyof Node>
>(
  type: T,
  values: V
): N => {
  const node = new Node()

  node.type = type

  const { build } = nodeDefs[type]
  build(node as any, values as any)

  return node as N & { type: T }
}

export const createNodeWithLoc = <
  T extends keyof NodeDefMap,
  D extends NodeDefMap[T],
  N extends ExtractNodeFromDef<D>
>(
  type: T,
  values: Omit<N, keyof Node>,
  location: {
    start: number
    end: number
    loc: Location
  }
): N & { start: number; end: number; loc: Location } => {
  const node = new Node()

  node.type = type
  node.start = location.start
  node.end = location.end
  node.loc = location.loc

  const { build } = nodeDefs[type]
  build(node as any, values as any)

  return node as N & { type: T; start: number; end: number; loc: Location }
}
