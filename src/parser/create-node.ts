import * as p from 'parsimmon'

import * as u from '../utils/index'
import * as n from '../nodes'
import { Node } from '../nodes'

import { WithLocation } from './typings'
import * as debug from '../utils/debug'

export const createNode = <N extends Node, V extends n.Plain<N>>(
  klass: typeof Node & Class<N>
) => (parser: p.Parser<V>): p.Parser<WithLocation<N>> =>
  p.seqMap(
    p.index,
    parser,
    p.index,
    (start: p.Index, value: V, end: p.Index) => {
      debug.parse(klass.name)
      return klass.create(value, { start, end })
    }
  )
