import * as p from 'parsimmon'
import * as u from '../utils/index'
import * as n from '../nodes'
import { helpers as h, wrappers as w, symbols as s } from './lib'

import { WithLocation, LanguageWithLocation, TypedPartialRule } from './typings'
import { Language, Expression } from './typings'
import { createNode } from './create-node'

const expressions = (r: p.TypedLanguage<LanguageWithLocation<Language>>) => [
  r.LogicalExpression,
  r.BinaryExpression,
  r.ConcatExpression,
  r.BooleanExpression,
  r.UnaryExpression,
  r.FunCallExpression,
  r.MemberExpression,
  r.literal,
  r.Header,
  r.Identifier,
]

export const expression: TypedPartialRule<
  LanguageWithLocation<Language>,
  LanguageWithLocation<Expression>
> = {
  expression: (r) => p.alt(...expressions(r)).desc('Expression'),

  Header: () =>
    p
      .lookahead(p.letters.then(p.alt(p.string('-'), p.string(':'))))
      .then(p.regex(/^[A-z][A-z0-9-:]*/i).map((name) => ({ name })))
      .thru(createNode(n.Header)),

  Identifier: () =>
    p
      .regex(/^[a-z0-9][\w\d]*/i)
      .map((name) => ({ name }))
      .thru(createNode(n.Identifier)),

  MemberExpression: (r) =>
    p
      .seq(
        r.Identifier.skip(p.string('.')),
        p.alt(r.MemberExpression, r.Header, r.Identifier)
      )
      .map(([object, property]) => ({
        object,
        property,
      }))
      .thru(createNode(n.MemberExpression)),

  BooleanExpression: (r) =>
    r.expression
      .thru(w.paren)
      .map(([lparen, body, rparen]) => ({ lparen, body, rparen }))
      .thru(createNode(n.BooleanExpression)),

  // TODO: array -> nest
  ConcatExpression: (r) =>
    p
      .alt(...expressions(r).filter((p) => p !== r.ConcatExpression)) // term
      .thru(w.margin)
      .atLeast(2)
      .map((body) => ({ body }))
      .thru(createNode(n.ConcatExpression)),

  FunCallExpression: (r) =>
    h
      .grease(
        p.alt(r.MemberExpression, r.Identifier),
        r.expression
          .thru(w.margin)
          .sepBy(s.comma)
          .thru(w.paren)
      )
      .map(([callee, [lparen, args, rparen]]) => ({
        callee,
        arguments: args,
        lparen,
        rparen,
      }))
      .thru(createNode(n.FunCallExpression)),

  UnaryExpression: (r) =>
    h
      .grease(s.unop, r.expression)
      .map(([operator, argument]) => ({
        operator,
        argument,
      }))
      .thru(createNode(n.UnaryExpression)),

  /*
    NOTE: Accept the input as an array and then reduce to make left-to-right
          in order to avoid infinity recursion because of left association
  */
  BinaryExpression: (r) => {
    /*
      NOTE: BinaryExpression NEVER has LogicalExpression nor ConcatExpression as its child(i.e. terminator)
            except for ones wrapped with parens as BooleanExpression.
     */
    const term = p.alt(
      ...expressions(r).filter(
        (p) =>
          p !== r.LogicalExpression &&
          p !== r.ConcatExpression &&
          p !== r.BinaryExpression
      )
    )

    return p
      .lookahead(h.grease(term, s.binop))
      .then(h.grease(term, h.grease(s.binop, term).atLeast(1)))
      .map(([first, follow]) =>
        follow.reduce(
          (left, [operator, right]) =>
            n.BinaryExpression.create(
              {
                left,
                operator,
                right,
              },
              {
                start: left.loc.start,
                end: right.loc.end,
              }
            ),
          first
        )
      ) as p.Parser<WithLocation<n.BinaryExpression>>
  },

  /*
    NOTE: Accept the input as an array and then reduce to make left-to-right
          in order to avoid infinity recursion because of left recursion
  */
  LogicalExpression: (r) => {
    // terminator
    const term = p.alt(
      ...expressions(r).filter(
        (p) => p !== r.LogicalExpression && p !== r.ConcatExpression
      )
    )

    return p
      .lookahead(h.grease(term, s.logop))
      .then(h.grease(term, h.grease(s.logop, term).atLeast(1)))
      .map(([first, follow]) =>
        follow.reduce(
          (left, [operator, right]) =>
            n.LogicalExpression.create(
              {
                left,
                operator,
                right,
              },
              {
                start: left.loc.start,
                end: right.loc.end,
              }
            ),
          first
        )
      ) as p.Parser<WithLocation<n.LogicalExpression>>
  },

  StructDefinitionExpression: (r) =>
    r.MemberAssignStatement.thru(w.list)
      .thru(w.bracket)
      .map(([lbracket, body, rbracket]) => ({ lbracket, body, rbracket }))
      .thru(createNode(n.StructDefinitionExpression)),
}
