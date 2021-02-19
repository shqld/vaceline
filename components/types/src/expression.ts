import { BaseNode } from '.'
import { Literal } from './literal'

export type Expression =
  | Literal
  | BinaryExpression
  | BooleanExpression
  | ConcatExpression
  | FunCallExpression
  | Identifier
  | LogicalExpression
  | Member
  | UnaryExpression
  | ValuePair
  | BackendDefinition
  | TableDefinition

export interface Identifier extends BaseNode {
  type: 'Identifier'
  name: string
}

export interface Member extends BaseNode {
  type: 'Member'
  base: Identifier | Member
  member: Identifier
}

export interface ValuePair extends BaseNode {
  type: 'ValuePair'
  base: Identifier | Member
  name: Identifier
}

export interface BooleanExpression extends BaseNode {
  type: 'BooleanExpression'
  body: Expression
}

export interface UnaryExpression extends BaseNode {
  type: 'UnaryExpression'
  operator: string
  argument: Expression
}

export interface FunCallExpression extends BaseNode {
  type: 'FunCallExpression'
  callee: Member | Identifier | ValuePair
  args: Array<Expression>
}

export interface ConcatExpression extends BaseNode {
  type: 'ConcatExpression'
  body: Array<Expression>
}

export interface BinaryExpression extends BaseNode {
  type: 'BinaryExpression'
  left: Expression
  right: Expression
  operator: string
}

export interface LogicalExpression extends BaseNode {
  type: 'LogicalExpression'
  left: Expression
  right: Expression
  operator: string
}

export interface BackendDefinition extends BaseNode {
  type: 'BackendDefinition'
  key: string
  value: Expression | Array<BackendDefinition>
}

export interface TableDefinition extends BaseNode {
  type: 'TableDefinition'
  key: string
  value: string
}
