import { Node } from '../nodes'

export interface Handler {
  entry?(path: NodePath<Node>): void
}

export interface TraversalContext {
  parent: Node | null
  parentPath: NodePath<Node> | null
  inList: boolean
  key?: number
  state: unknown
}

export class NodePath<T extends Node = Node> implements TraversalContext {
  node: T

  parent: Node | null
  // hub: HubInterface;
  // contexts: Array<TraversalContext>;
  // data: Object;
  // shouldSkip: boolean;
  // shouldStop: boolean;
  // removed: boolean;
  state!: unknown
  // opts?: Object
  // skipKeys?: Object
  parentPath!: NodePath<Node> | null
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
