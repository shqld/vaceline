import { Node } from './nodes/node'
import { Token } from './parser/tokenizer'

export type Literal =
  | BooleanLiteral
  | StringLiteral
  | MultilineLiteral
  | DurationLiteral
  | NumericLiteral

export type Expression =
  | Literal
  | Identifier
  | Header
  | Ip
  | Member
  | BooleanExpression
  | UnaryExpression
  | FunCallExpression
  | ConcatExpression
  | BinaryExpression
  | LogicalExpression

export type Statement =
  | ExpressionStatement
  | IncludeStatement
  | ImportStatement
  | CallStatement
  | DeclareStatement
  | AddStatement
  | SetStatement
  | UnsetStatement
  | ReturnStatement
  | ErrorStatement
  | RestartStatement
  | SyntheticStatement
  | LogStatement
  | IfStatement
  | SubroutineStatement
  | AclStatement
  | CustomStatement
  | BackendStatement
  | TableStatement

export interface File extends Node {
  type: 'File'
  filePath: string
  program: Program
  comments: Array<Token>
}

export interface Program extends Node {
  type: 'Program'
  body: Array<Statement | Comment>
}

export interface Comment extends Node {
  type: 'Comment'
  // TODO: add `type` prop
  body: string
}

// TODO: remove this node
export interface Block extends Node {
  type: 'Block'
  body: Array<Statement | Comment>
}

export interface BooleanLiteral extends Node {
  type: 'BooleanLiteral'
  value: string
}

export interface StringLiteral extends Node {
  type: 'StringLiteral'
  value: string
}

// TODO: merge with StringLiteral
export interface MultilineLiteral extends Node {
  type: 'MultilineLiteral'
  value: string
}

export interface DurationLiteral extends Node {
  type: 'DurationLiteral'
  value: string
}

export interface NumericLiteral extends Node {
  type: 'NumericLiteral'
  value: string
}

export interface Identifier extends Node {
  type: 'Identifier'
  name: string
}

export interface Header extends Node {
  type: 'Header'
  name: string
}

export interface Ip extends Node {
  type: 'Ip'
  value: string
  cidr?: number
}

export interface Member extends Node {
  type: 'Member'
  base: Identifier | Member
  member: Identifier | Header
}

export interface BooleanExpression extends Node {
  type: 'BooleanExpression'
  body: Expression
}

export interface UnaryExpression extends Node {
  type: 'UnaryExpression'
  operator: string
  argument: Expression
}

export interface FunCallExpression extends Node {
  type: 'FunCallExpression'
  callee: Member | Identifier
  arguments: Array<Expression>
}

export interface ConcatExpression extends Node {
  type: 'ConcatExpression'
  body: Array<Expression>
}

export interface BinaryExpression extends Node {
  type: 'BinaryExpression'
  left: Expression
  right: Expression
  operator: string
}

export interface LogicalExpression extends Node {
  type: 'LogicalExpression'
  left: Expression
  right: Expression
  operator: string
}

export interface ExpressionStatement extends Node {
  type: 'ExpressionStatement'
  body: Expression
}

export interface IncludeStatement extends Node {
  type: 'IncludeStatement'
  module: StringLiteral
}
export interface ImportStatement extends Node {
  type: 'ImportStatement'
  module: Identifier
}

export interface CallStatement extends Node {
  type: 'CallStatement'
  subroutine: Identifier
}

export interface DeclareStatement extends Node {
  type: 'DeclareStatement'
  id: Identifier | Member
  valueType: 'STRING' | 'BOOL' | 'BOOLEAN' | 'INTEGER' | 'FLOAT'
}

export interface AddStatement extends Node {
  type: 'AddStatement'
  left: Identifier | Member
  right: Expression
  operator: string
}

export interface SetStatement extends Node {
  type: 'SetStatement'
  left: Identifier | Member
  right: Expression
  operator: string
}

export interface UnsetStatement extends Node {
  type: 'UnsetStatement'
  id: Identifier | Member
}

export interface ReturnStatement extends Node {
  type: 'ReturnStatement'
  action: 'pass' | 'hit_for_pass' | 'lookup' | 'pipe' | 'deliver'
}

export interface ErrorStatement extends Node {
  type: 'ErrorStatement'
  status: Literal
  message?: Expression
}

export interface RestartStatement extends Node {
  type: 'RestartStatement'
}

export interface SyntheticStatement extends Node {
  type: 'SyntheticStatement'
  response: Expression
}

export interface LogStatement extends Node {
  type: 'LogStatement'
  content: Expression
}

export interface IfStatement extends Node {
  type: 'IfStatement'
  test: Expression
  consequent: Array<Statement>
  alternative?: IfStatement | Array<Statement>
}

export interface SubroutineStatement extends Node {
  type: 'SubroutineStatement'
  id: Identifier
  body: Array<Statement>
}

export interface AclStatement extends Node {
  type: 'AclStatement'
  id: Identifier
  body: Array<Ip>
}

export interface CustomStatement extends Node {
  type: 'CustomStatement'
  directive: string
  body: Array<Node>
}

export type BackendDef = { key: string; value: Expression | Array<BackendDef> }

export interface BackendStatement extends Node {
  type: 'BackendStatement'
  id: Identifier
  body: Array<BackendDef>
}

export type TableDef = { key: string; value: string }

export interface TableStatement extends Node {
  type: 'TableStatement'
  id: Identifier
  body: Array<TableDef>
}
