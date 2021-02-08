import { Program } from './program'
import { Expression } from './expression'
import { Statement } from './statement'

import { Location } from './location'
import { Comment } from './comment'

export * from './program'
export * from './statement'
export * from './expression'
export * from './literal'

export * from './location'
export * from './comment'

export type Node = Program | Statement | Expression
export type PlainNode<N extends Node> = Omit<N, keyof Node>
export type Located<N extends Node = Node> = N & { loc: Location }

export interface BaseNode {
  type: string
  loc?: Location
  leadingComments?: Array<Comment>
  innerComments?: Array<Comment>
  trailingComments?: Array<Comment>
}

export type NodeType = Node['type']
