import * as p from 'parsimmon'
import * as n from '../nodes'
export type WithLocation<T> = T & { loc: n.SourceLocation }

export type LanguageWithLocation<Language> = {
  [K in keyof Language]: WithLocation<Language[K]>
}

export type TypedPartialRule<LanguageSpec, LanguagePartialSpec> = {
  [P in keyof LanguagePartialSpec]: (
    r: p.TypedLanguage<LanguageSpec>
  ) => p.Parser<LanguagePartialSpec[P]>
}

export type Expression = {
  expression: n.Expression
  Identifier: n.Identifier
  Header: n.Header
  MemberExpression: n.MemberExpression
  BooleanExpression: n.BooleanExpression
  ConcatExpression: n.ConcatExpression
  FunCallExpression: n.FunCallExpression
  UnaryExpression: n.UnaryExpression

  BinaryExpression: n.BinaryExpression
  LogicalExpression: n.LogicalExpression

  StructDefinitionExpression: n.StructDefinitionExpression
}

export type Literal = {
  BooleanLiteral: n.BooleanLiteral
  StringLiteral: n.StringLiteral
  MultilineLiteral: n.MultilineLiteral
  DurationLiteral: n.DurationLiteral
  NumericLiteral: n.NumericLiteral
  IpLiteral: n.IpLiteral
  literal: n.Literal
}

export type Statement = {
  statement: n.Statement
  ExpressionStatement: n.ExpressionStatement
  IncludeStatement: n.IncludeStatement
  ImportStatement: n.ImportStatement
  CallStatement: n.CallStatement
  DeclareStatement: n.DeclareStatement
  AddStatement: n.AddStatement
  SetStatement: n.SetStatement
  UnsetStatement: n.UnsetStatement
  ReturnStatement: n.ReturnStatement
  ErrorStatement: n.ErrorStatement
  RestartStatement: n.RestartStatement
  SyntheticStatement: n.SyntheticStatement
  LogStatement: n.LogStatement
  IfStatement: n.IfStatement
  SubroutineStatement: n.SubroutineStatement
  AclStatement: n.AclStatement
  MemberAssignStatement: n.MemberAssignStatement
  BackendStatement: n.BackendStatement
}

export type Language = Expression &
  Literal &
  Statement & {
    File: Exclude<n.File, 'filePath'>
    Program: n.Program

    block: n.Block
    customStatement: n.CustomStatement
  }
