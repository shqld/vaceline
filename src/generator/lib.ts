import { Node, Printable } from '../nodes'

export interface PrintList {
  nodes: Array<Node>
  isList: true
  sep?: string
}

export const list = (nodes: Array<Node>, sep?: string): PrintList => ({
  nodes,
  sep,
  isList: true,
})
