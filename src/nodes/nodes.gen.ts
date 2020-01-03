import * as d from './defs'

export interface Nodes {
  Program: d.Program
  BooleanLiteral: d.BooleanLiteral
  StringLiteral: d.StringLiteral
  MultilineLiteral: d.MultilineLiteral
  DurationLiteral: d.DurationLiteral
  NumericLiteral: d.NumericLiteral
  Identifier: d.Identifier
  Ip: d.Ip
  Member: d.Member
  ValuePair: d.ValuePair
  BooleanExpression: d.BooleanExpression
  UnaryExpression: d.UnaryExpression
  FunCallExpression: d.FunCallExpression
  ConcatExpression: d.ConcatExpression
  BinaryExpression: d.BinaryExpression
  LogicalExpression: d.LogicalExpression
  ExpressionStatement: d.ExpressionStatement
  IncludeStatement: d.IncludeStatement
  ImportStatement: d.ImportStatement
  CallStatement: d.CallStatement
  DeclareStatement: d.DeclareStatement
  AddStatement: d.AddStatement
  SetStatement: d.SetStatement
  UnsetStatement: d.UnsetStatement
  ReturnStatement: d.ReturnStatement
  ErrorStatement: d.ErrorStatement
  RestartStatement: d.RestartStatement
  SyntheticStatement: d.SyntheticStatement
  LogStatement: d.LogStatement
  IfStatement: d.IfStatement
  SubroutineStatement: d.SubroutineStatement
  AclStatement: d.AclStatement
  BackendDefinition: d.BackendDefinition
  BackendStatement: d.BackendStatement
  TableDefinition: d.TableDefinition
  TableStatement: d.TableStatement
}
