import * as p from 'parsimmon'

import * as u from '../utils/index'
import * as n from '../nodes'
import { helpers as h, wrappers as w, symbols as s } from './lib'

import {
  LanguageWithLocation,
  Language,
  TypedPartialRule,
  Literal,
} from './typings'
import { createNode } from './create-node'

export const literal: TypedPartialRule<
  LanguageWithLocation<Language>,
  LanguageWithLocation<Literal>
> = {
  literal: (r) =>
    p.alt(
      r.BooleanLiteral,
      r.StringLiteral,
      r.DurationLiteral,
      r.NumericLiteral,
      r.IpLiteral,
      r.MultilineLiteral
    ),

  BooleanLiteral: () =>
    h
      .oneOfWords('true', 'false')
      .map((value) => ({ value }))
      .thru(createNode(n.BooleanLiteral)),

  IpLiteral: () =>
    p
      .regexp(/"[a-fA-F0-9:.]+"(\/\d+)?/)
      .map((value) => ({ value }))
      .thru(createNode(n.NumericLiteral)),

  // TODO: Do not allow multiline
  StringLiteral: () =>
    p
      .regexp(/"((?:\\.|.)*?)"/, 1)
      .map((value) => ({ value }))
      .thru(createNode(n.StringLiteral)),

  MultilineLiteral: () =>
    p
      .regexp(/{"((?:\\.|.|\n|")*?)"}/, 1)
      .map((value) => ({ value }))
      .thru(createNode(n.MultilineLiteral)),

  DurationLiteral: () =>
    p
      .regexp(/\d+(ms|s|m|h|d|w|y)/)
      .map((value) => ({ value }))
      .thru(createNode(n.DurationLiteral)),

  NumericLiteral: () =>
    p
      .regexp(/\d+(\.\d+)?/)
      .map((value) => ({ value }))
      .thru(createNode(n.NumericLiteral)),
}
