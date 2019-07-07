import * as p from 'parsimmon'

import * as n from '../nodes'

import { createNode } from './create-node'

export const Comment = p
  .alt(
    p
      .alt(p.string('//'), p.string('#'))
      .then(p.regexp(/[^\n]*/))
      .skip(p.string('\n'))
    // TODO:
    // p.string('/*').then(p.regexp(/([\s\S]*?)\*\//m))
  )
  .map((body) => ({ body }))
  .thru(createNode(n.Comment))
  .desc('Comment')
