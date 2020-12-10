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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static create<T>(this: { new (): T }, props: T): T {
    return new this()
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

export const buildNode = <T extends Node>(klass: {
  new (): T
}): { new (): T; create: (props: T, loc?: Location) => T } => {
  const propNames = Object.getOwnPropertyNames(new klass())
  const src = [
    'const obj = new this();',
    'if (props.loc) obj.loc = props.loc;',
    ...propNames.map((name) => `obj['${name}'] = props['${name}'];`),
    'return obj;',
  ].join('\n')

  const create = new Function('props', src) as (props: T, loc?: Location) => T

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  klass.create = create

  return klass as { new (): T; create: (props: T, loc?: Location) => T }
}
