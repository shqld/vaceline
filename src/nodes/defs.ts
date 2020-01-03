import { BaseNode } from './node'

export type Node = Program | Statement | Expression

export type Statement =
  | AclStatement
  | AddStatement
  | BackendStatement
  | CallStatement
  | DeclareStatement
  | ErrorStatement
  | ExpressionStatement
  | IfStatement
  | ImportStatement
  | IncludeStatement
  | LogStatement
  | RestartStatement
  | ReturnStatement
  | SetStatement
  | SubroutineStatement
  | SyntheticStatement
  | TableStatement
  | UnsetStatement

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

export type Literal =
  | BooleanLiteral
  | DurationLiteral
  | MultilineLiteral
  | NumericLiteral
  | StringLiteral
  | Ip

export interface Program extends BaseNode {
  type: 'Program'
  body: Array<Statement>
}

export interface BooleanLiteral extends BaseNode {
  type: 'BooleanLiteral'
  value: string
}

export interface StringLiteral extends BaseNode {
  type: 'StringLiteral'
  value: string
}

export interface MultilineLiteral extends BaseNode {
  type: 'MultilineLiteral'
  value: string
}

export interface DurationLiteral extends BaseNode {
  type: 'DurationLiteral'
  value: string
}

export interface NumericLiteral extends BaseNode {
  type: 'NumericLiteral'
  value: string
}

export interface Identifier extends BaseNode {
  type: 'Identifier'
  name: string
}

export interface Ip extends BaseNode {
  type: 'Ip'
  value: string
  cidr?: number
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

export interface ExpressionStatement extends BaseNode {
  type: 'ExpressionStatement'
  body: Expression
}

export interface IncludeStatement extends BaseNode {
  type: 'IncludeStatement'
  module: StringLiteral
}

export interface ImportStatement extends BaseNode {
  type: 'ImportStatement'
  module: Identifier
}

export interface CallStatement extends BaseNode {
  type: 'CallStatement'
  subroutine: Identifier
}

export type DeclareValueType =
  | 'STRING'
  | 'BOOL'
  | 'BOOLEAN'
  | 'INTEGER'
  | 'FLOAT'

export interface DeclareStatement extends BaseNode {
  type: 'DeclareStatement'
  id: Identifier | Member
  valueType: DeclareValueType
}

export interface AddStatement extends BaseNode {
  type: 'AddStatement'
  left: Identifier | Member
  right: Expression
  operator: string
}

export interface SetStatement extends BaseNode {
  type: 'SetStatement'
  left: Identifier | Member
  right: Expression
  operator: string
}

export interface UnsetStatement extends BaseNode {
  type: 'UnsetStatement'
  id: Identifier | Member
}

export type ReturnActionName =
  | 'pass'
  | 'hit_for_pass'
  | 'lookup'
  | 'pipe'
  | 'deliver'

export interface ReturnStatement extends BaseNode {
  type: 'ReturnStatement'
  action: ReturnActionName
}

export interface ErrorStatement extends BaseNode {
  type: 'ErrorStatement'
  status: number
  message?: Expression
}

export interface RestartStatement extends BaseNode {
  type: 'RestartStatement'
}

export interface SyntheticStatement extends BaseNode {
  type: 'SyntheticStatement'
  response: Expression
}

export interface LogStatement extends BaseNode {
  type: 'LogStatement'
  content: Expression
}

export interface IfStatement extends BaseNode {
  type: 'IfStatement'
  test: Expression
  consequent: Array<Statement>
  alternative?: IfStatement | Array<Statement>
}

export interface SubroutineStatement extends BaseNode {
  type: 'SubroutineStatement'
  id: Identifier
  body: Array<Statement>
}

export interface AclStatement extends BaseNode {
  type: 'AclStatement'
  id: Identifier
  body: Array<Ip>
}

export interface BackendDefinition extends BaseNode {
  type: 'BackendDefinition'
  key: string
  value: Expression | Array<BackendDefinition>
}

export interface BackendStatement extends BaseNode {
  type: 'BackendStatement'
  id: Identifier
  body: Array<BackendDefinition>
}

export interface TableDefinition extends BaseNode {
  type: 'TableDefinition'
  key: string
  value: string
}

export interface TableStatement extends BaseNode {
  type: 'TableStatement'
  id: Identifier
  body: Array<TableDefinition>
}
