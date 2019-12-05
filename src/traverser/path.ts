import { Node, BaseNode, Identifier } from '../nodes'
import { traverse } from '.'
import { isNode } from '../utils/node'

export interface Handler {
  entry?(path: NodePath<any>): void
}

export interface TraversalContext {
  parent: BaseNode | null
  parentPath: NodePath<any> | null
  inList: boolean
  key?: number
  state: any
}

export class NodePath<T extends BaseNode = BaseNode>
  implements TraversalContext {
  node: T

  parent: BaseNode | null
  // hub: HubInterface;
  // contexts: Array<TraversalContext>;
  // data: Object;
  // shouldSkip: boolean;
  // shouldStop: boolean;
  // removed: boolean;
  state!: any
  // opts?: Object
  // skipKeys?: Object
  parentPath!: NodePath<any> | null
  context!: TraversalContext
  // container?: Object | Array<Object>
  listKey?: string
  inList: boolean
  parentKey?: string
  key?: number
  // scope?: Scope;
  // type?: string
  // typeAnnotation?: Object

  constructor(node: T, context: TraversalContext) {
    this.node = node

    this.parent = context.parent
    this.parentPath = context.parentPath
    this.inList = context.inList
    this.key = context.key

    this.state = context.state
  }

  // getSibling(key: number) {
  //   if (this.inList) return this.parentPath.nodes
  // }

  // TODO:
  // Manipulation
  // replaceWith() {}
  // replaceWithMultiple() {}
  // insertBefore() {}
  // insertAfter() {}
  // remove() {}
}
