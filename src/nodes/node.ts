import { assert } from '../utils/assert'
import { NodeType, NodeAs, nodeDefs } from './node-def'

export interface Position {
  line: number
  column: number
}

export interface Location {
  start: Position
  end: Position
}

export type PlainNode<T extends Node> = Omit<T, keyof Node>

export class Node {
  type!: string
  start?: number
  end?: number
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

  // When creating node with location,
  // always define node.{start|end|loc} ahead of other values
  // to maximize JIT optimization with hidden class by V8
  static createWithLoc = <T extends NodeType, N extends NodeAs<T>>(
    type: T,
    values: PlainNode<N>,
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

    const def = nodeDefs[type]

    assert(def != null, `type ${type} is not defined in node definitions`)

    def.build(node as any, values as any)

    return node as N & { type: T; start: number; end: number; loc: Location }
  }
}
