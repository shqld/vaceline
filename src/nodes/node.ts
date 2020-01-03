import { Doc } from 'prettier'

import { Node as UnionNode } from './defs'
import { State, printNode } from '../generator/printAST'
import { NodeType } from '.'
import { Nodes } from './nodes.gen'

export interface Position {
  offset: number
  line: number
  column: number
}

export interface Location {
  start: Position
  end: Position
}

export const buildEmptryLocation = (): Location => ({
  start: {
    offset: NaN,
    line: NaN,
    column: NaN,
  },
  end: {
    offset: NaN,
    line: NaN,
    column: NaN,
  },
})

export type PlainNode<N extends Node> = Omit<N, keyof Node>
export type NodeWithLoc<N extends Node = Node> = N & { loc: Location }

const flat = <T>(arr: Array<T>) =>
  arr.reduce((acc, cur) => acc.concat(cur), [] as Array<T>)

export { Node as BaseNode }

class Node {
  type!: string
  loc?: Location

  next(): Array<Node> {
    return flat(
      Object.values(this).filter((v) => Array.isArray(v) || v instanceof Node)
    )
  }

  print(state: State, options?: object): Doc {
    return printNode(this as UnionNode, state, options)
  }

  is<T extends Array<NodeType>>(...types: T): this is Nodes[T[number]] {
    return types.includes(this.type as NodeType)
  }
}
