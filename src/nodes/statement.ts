import {
  BackendDefinition,
  Expression,
  Identifier,
  Member,
  TableDefinition,
  ValuePair,
} from './expression'
import { Ip, StringLiteral } from './literal'
import { BaseNode } from '.'

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
  left: Identifier | Member | ValuePair
  right: Expression
  operator: string
}

export interface SetStatement extends BaseNode {
  type: 'SetStatement'
  left: Identifier | Member | ValuePair
  right: Expression
  operator: string
}

export interface UnsetStatement extends BaseNode {
  type: 'UnsetStatement'
  id: Identifier | Member | ValuePair
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

export interface BackendStatement extends BaseNode {
  type: 'BackendStatement'
  id: Identifier
  body: Array<BackendDefinition>
}

export interface TableStatement extends BaseNode {
  type: 'TableStatement'
  id: Identifier
  body: Array<TableDefinition>
}
