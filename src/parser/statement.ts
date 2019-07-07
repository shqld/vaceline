import * as p from 'parsimmon'

import * as u from '../utils/index'
import * as n from '../nodes'
import { helpers as h, wrappers as w, symbols as s } from './lib'

import {
  LanguageWithLocation,
  Language,
  TypedPartialRule,
  Statement,
} from './typings'
import { createNode } from './create-node'

export const statement: TypedPartialRule<
  LanguageWithLocation<Language>,
  LanguageWithLocation<Statement>
> = {
  statement: (r) =>
    p
      .alt(
        r.IncludeStatement,
        r.ImportStatement,
        r.CallStatement,
        r.DeclareStatement,
        r.AddStatement,
        r.SetStatement,
        r.UnsetStatement,
        r.ReturnStatement,
        r.ErrorStatement,
        r.RestartStatement,
        r.SyntheticStatement,
        r.LogStatement,
        r.IfStatement,
        r.SubroutineStatement,
        r.AclStatement,
        r.BackendStatement,
        r.customStatement,
        r.ExpressionStatement // This should be last
      )
      .desc('Statement'),

  ExpressionStatement: (r) =>
    r.expression
      .thru(w.semi)
      .map((body: n.Expression) => ({ body }))
      .thru(createNode(n.ExpressionStatement)),

  IncludeStatement: (r) =>
    h
      .directive('include')
      .then(r.StringLiteral)
      .thru(w.semi)
      .map((module: n.StringLiteral) => ({ module }))
      .thru(createNode(n.IncludeStatement)),

  ImportStatement: (r) =>
    h
      .directive('import')
      .then(r.Identifier)
      .thru(w.semi)
      // TODO:
      .map((module: n.Identifier) => ({ module }))
      .thru(createNode(n.ImportStatement)),

  CallStatement: (r) =>
    h
      .directive('call')
      .then(r.Identifier)
      .thru(w.semi)
      .map((subroutine) => ({ subroutine }))
      .thru(createNode(n.CallStatement)),
  DeclareStatement: (r) =>
    h
      .grease(h.directive('declare'), h.directive('local'))
      .then(
        h.grease(p.alt(r.MemberExpression, r.Identifier), h.oneOfWords(
          'STRING',
          'BOOL',
          'BOOLEAN',
          'INTEGER',
          'FLOAT'
        ) as p.Parser<n.ValueType>)
      )
      .thru(w.semi)
      .map(([id, valueType]) => ({ id, valueType }))
      .thru(createNode(n.DeclareStatement)),

  AddStatement: (r) =>
    h
      .directive('add')
      .then(h.grease(r.MemberExpression, s.assigop, r.expression))
      .thru(w.semi)
      .map(([left, operator, right]) => ({
        operator,
        left,
        right,
      }))
      .thru(createNode(n.AddStatement)),
  SetStatement: (r) =>
    h
      .directive('set')
      .then(h.grease(r.MemberExpression, s.assigop, r.expression))
      .thru(w.semi)
      .map(([left, operator, right]) => ({
        operator,
        left,
        right,
      }))
      .thru(createNode(n.SetStatement)),
  UnsetStatement: (r) =>
    h
      .directive('unset')
      .then(r.MemberExpression)
      .thru(w.semi)
      .map((id) => ({ id }))
      .thru(createNode(n.UnsetStatement)),
  ReturnStatement: () =>
    h
      .directive('return')
      .then(
        (h.oneOfWords(
          'fetch',
          'pass',
          'hit_for_pass',
          'lookup',
          'pipe',
          'deliver'
        ) as p.Parser<n.ReturnAction>).thru(w.paren)
      )
      .thru(w.semi)
      .map(([lparen, action, rparen]) => ({ lparen, action, rparen }))
      .thru(createNode(n.ReturnStatement)),
  ErrorStatement: (r) =>
    h
      .directive('error')
      .then(
        p.alt(
          h.grease(r.NumericLiteral, r.expression),
          h.grease(r.NumericLiteral)
        )
      )
      .thru(w.semi)
      .map(([status, message]) => ({ status, message: u.nullOr(message) }))
      .thru(createNode(n.ErrorStatement)),
  RestartStatement: () =>
    h
      .directive('restart')
      .thru(w.semi)
      .thru(createNode(n.RestartStatement)),
  SyntheticStatement: (r) =>
    h
      .directive('synthetic')
      .then(r.expression)
      .thru(w.semi)
      .map((response) => ({ response }))
      .thru(createNode(n.SyntheticStatement)),
  LogStatement: (r) =>
    h
      .directive('log')
      .then(r.expression)
      .thru(w.semi)
      .map((content) => ({ content }))
      .thru(createNode(n.LogStatement)),

  IfStatement: (r) =>
    h
      .directive('if')
      .then(
        p.alt(
          h.grease(
            r.expression.thru(w.paren),
            r.block,
            h.directive('else').then(p.alt(r.IfStatement, r.block))
          ),
          h.grease(r.expression.thru(w.paren), r.block)
        )
      )
      .map(([[lparen, test, rparen], consequent, alternative]) => ({
        lparen,
        test,
        rparen,
        consequent,
        alternative: u.nullOr(alternative),
      }))
      .thru(createNode(n.IfStatement)),

  SubroutineStatement: (r) =>
    h
      .directive('sub')
      .then(h.grease(r.Identifier, r.block))
      .map(([id, body]) => ({ id, body }))
      .thru(createNode(n.SubroutineStatement)),

  AclStatement: (r) =>
    h
      .directive('acl')
      .then(
        h.grease(
          r.Identifier,
          r.IpLiteral.thru(w.semi)
            .thru(w.list)
            .thru(w.bracket)
        )
      )
      .map(([id, [lbracket, body, rbracket]]) => ({
        id,
        lbracket,
        body,
        rbracket,
      }))
      .thru(createNode(n.AclStatement)),

  MemberAssignStatement: (r) =>
    h
      .grease(
        p.string('.').then(r.Identifier),
        w
          .margin(p.string('='))
          .then(p.alt(r.StructDefinitionExpression, r.expression))
      )
      .map(([id, value]) => ({ id, value }))
      .thru(w.semi)
      .thru(createNode(n.MemberAssignStatement)),

  BackendStatement: (r) =>
    h
      .directive('backend')
      .then(h.grease(r.Identifier, r.StructDefinitionExpression))
      .map(([id, body]) => ({ id, body }))
      .thru(createNode(n.BackendStatement)),
}
