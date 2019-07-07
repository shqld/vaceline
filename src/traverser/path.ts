import { Identifier, Node, Plain } from '../nodes'
import { traverse } from '.'

export interface Handler {
  entry?(path: NodePath<any>): void
}

export interface TraversalContext {
  parent: Node | null
  parentPath: NodePath<any> | null
  inList: boolean
  key?: number
  state: any
}

export class NodePath<T extends Node> implements TraversalContext {
  node!: T

  parent!: Node | null
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
  inList!: boolean
  parentKey?: string
  key?: number
  // scope?: Scope;
  // type?: string
  // typeAnnotation?: Object

  static create<T extends Node>(
    this: Class<NodePath<T>>,
    node: T,
    context: TraversalContext
  ) {
    const path = new this()

    path.node = node
    path.parent = context.parent
    path.parentPath = context.parentPath
    path.inList = context.inList
    path.key = context.key

    path.state = context.state

    return path
  }

  isIdentifier(
    this: NodePath<any>,
    query?: Partial<Identifier>
  ): this is NodePath<Identifier> {
    return (
      this.node instanceof Identifier &&
      (query == undefined
        ? true
        : Object.entries(query).every(([k, v]) => this.node[k] === v))
    )
  }

  // FIXME:
  get<T extends Node>(this: NodePath<T>, field: keyof T): NodePath<any> {
    const prop = this.node[field]

    if (!(prop instanceof Node)) {
      throw new Error('asdf')
    }

    return NodePath.create(prop, {
      ...this.context,
      parent: this.node,
      parentPath: this,
    })
  }

  traverse(handler: Handler, state: any): void {
    traverse(this.node, handler, { ...this.context, state })
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
