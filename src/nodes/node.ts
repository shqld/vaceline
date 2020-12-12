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

// const flat = <T>(arr: Array<T>) =>
//   arr.reduce((acc, cur) => acc.concat(cur), [] as Array<T>)

const kCache = Symbol()

type NodeKlass<T> = typeof Node & { new (): T }

export abstract class Node {
  loc?: Location

  constructor() {
    this.loc = {
      start: {
        offset: 0,
        line: 0,
        column: 0,
      },
      end: {
        offset: 0,
        line: 0,
        column: 0,
      },
    }
  }

  static [kCache]: Function
  static create<T>(this: NodeKlass<T>, props: T): T {
    const func = this[kCache]

    if (!func) this[kCache] = buildCreateNode(this)

    return func(props)
  }

  // next(): Array<Node> {
  //   return flat(
  //     Object.values(this).filter((v) => Array.isArray(v) || v instanceof Node)
  //   )
  // }

  // print(state: State, options?: object): Doc {
  //   return printNode(this, state, options)
  // }

  // is<T extends Array<NodeType>>(...types: T): this is Nodes[T[number]] {
  //   return types.includes(this.type as NodeType)
  // }
}

export const buildCreateNode = <T>(klass: NodeKlass<T>): Function => {
  const propNames = Object.getOwnPropertyNames(new klass())
  const src = [
    'const obj = new this();',
    'if (props.loc) obj.loc = props.loc;',
    ...propNames.map((name) => `obj['${name}'] = props['${name}'];`),
    'return obj;',
  ].join('\n')

  return new Function('props', src)
}
