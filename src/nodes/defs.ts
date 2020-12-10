import { Node } from './node'

export class Program extends Node {
  body: Array<Statement>
}

export abstract class Expression extends Node {}

export abstract class Literal extends Expression {}

export class BooleanLiteral extends Literal {
  value: string
}

export class StringLiteral extends Literal {
  value: string
}

export class MultilineLiteral extends Literal {
  value: string
}

export class DurationLiteral extends Literal {
  value: string
}

export class NumericLiteral extends Literal {
  value: string
}

export class Identifier extends Expression {
  name: string
}

export class Ip extends Expression {
  value: string
  cidr?: number
}

export class Member extends Expression {
  base: Identifier | Member
  member: Identifier
}

export class ValuePair extends Expression {
  base: Identifier | Member
  name: Identifier
}

export class BooleanExpression extends Expression {
  body: Expression
}

export class UnaryExpression extends Expression {
  operator: string
  argument: Expression
}

export class FunCallExpression extends Expression {
  callee: Member | Identifier | ValuePair
  args: Array<Expression>
}

export class ConcatExpression extends Expression {
  body: Array<Expression>
}

export class BinaryExpression extends Expression {
  left: Expression
  right: Expression
  operator: string
}

export class LogicalExpression extends Expression {
  left: Expression
  right: Expression
  operator: string
}

export abstract class Statement extends Node {}

export class ExpressionStatement extends Statement {
  body: Expression
}

export class IncludeStatement extends Statement {
  module: StringLiteral
}

export class ImportStatement extends Statement {
  module: Identifier
}

export class CallStatement extends Statement {
  subroutine: Identifier
}

export class DeclareStatement extends Statement {
  id: Identifier | Member
  valueType: 'STRING' | 'BOOL' | 'BOOLEAN' | 'INTEGER' | 'FLOAT'
}

export class AddStatement extends Statement {
  left: Identifier | Member
  right: Expression
  operator: string
}

export class SetStatement extends Statement {
  left: Identifier | Member
  right: Expression
  operator: string
}

export class UnsetStatement extends Statement {
  id: Identifier | Member | ValuePair
}

export class ReturnStatement extends Statement {
  action: 'pass' | 'hit_for_pass' | 'lookup' | 'pipe' | 'deliver'
}

export class ErrorStatement extends Statement {
  status: number
  message?: Expression
}

export class RestartStatement extends Statement {}

export class SyntheticStatement extends Statement {
  response: Expression
}

export class LogStatement extends Statement {
  content: Expression
}

export class IfStatement extends Statement {
  test: Expression
  consequent: Array<Statement>
  alternative?: IfStatement | Array<Statement>
}

export class SubroutineStatement extends Statement {
  id: Identifier
  body: Array<Statement>
}

export class AclStatement extends Statement {
  id: Identifier
  body: Array<Ip>
}

export class BackendDefinition extends Statement {
  key: string
  value: Expression | Array<BackendDefinition>
}

export class BackendStatement extends Statement {
  id: Identifier
  body: Array<BackendDefinition>
}

export class TableDefinition extends Statement {
  key: string
  value: string
}

export class TableStatement extends Statement {
  id: Identifier
  body: Array<TableDefinition>
}
