import { assert } from '../utils/assert'
import { NodeType, NodeAs, nodeDefs } from './node-def'

export interface Position {
  offset: number
  line: number
  column: number
}

export interface Location {
  start: Position
  end: Position
}

export type PlainNode<T extends Node> = Omit<T, keyof Node>
export type NodeWithLocation = Node & { loc: Location }

export type NodeWithLoc = Node & { loc: Location }

export class Node {
  type!: string
  loc?: Location

  static create = <
    T extends NodeType,
    N extends NodeAs<T>,
    V extends PlainNode<N>
  >(
    type: T,
    values: V
  ): N => {
    const node = new Node()

    node.type = type

    const def = nodeDefs[type]

    assert(def != null, `type ${type} is not defined in node definitions`)

    def.build(node as any, values as any)

    return node as N & { type: T }
  }

  static build<T extends NodeType, N extends NodeAs<T>>(
    node: Node,
    type: T,
    values: PlainNode<N>
  ): N & { loc: Location } {
    node.type = type

    const def = nodeDefs[type]

    assert(def != null, `type ${type} is not defined in node definitions`)

    def.build(node as any, values as any)

    return node as N & { type: T; start: number; end: number; loc: Location }
  }
}
