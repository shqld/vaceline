import * as g from '../generator/lib'
import { Index } from 'parsimmon'
import { WithLocation } from '../parser/typings'

export type SourceLocation = {
  start: Index
  end: Index
}

export interface Mark {
  value: string
  loc: SourceLocation
}

export type Printable = string | g.PrintList | Mark | Node

export type Plain<N> = Emit<N, keyof Node>

export abstract class Node {
  type!: string
  loc?: SourceLocation

  abstract print: () => Printable | Array<Printable>
  abstract next: () => null | Array<Node | /* List */ Array<Node>>

  static create<T extends Node>(this: { new (): T }, fields: Plain<T>): T
  static create<T extends Node>(
    this: { new (): T },
    fields: Plain<T>,
    loc: SourceLocation
  ): WithLocation<T>

  static create<T extends Node>(
    this: { new (): T },
    fields: Plain<T>,
    loc?: SourceLocation
  ) {
    const node = new this()
    node.loc = loc
    return Object.assign(node, fields)
  }
}
export abstract class Statement extends Node {}
export abstract class Expression extends Node {}
export abstract class Value extends Node {}
export abstract class Literal extends Node {}

export class File extends Node {
  type = 'File'
  filePath!: string
  program!: Program

  print = () => this.program
  next = () => [this.program]
}

export class Program extends Node {
  type = 'Program'
  body!: Array<Statement | Comment>

  print = () => g.list(this.body)
  next = () => [this.body]
}

export class Comment extends Node {
  type = 'Comment'
  // TODO: add `type` prop
  body!: string

  print = () => ['#', this.body]
  next = () => null
}

// TODO: remove this node
export class Block extends Node {
  type = 'Block'
  body!: Array<Statement | Comment>
  lbracket!: Mark
  rbracket!: Mark

  print = () => [this.lbracket, g.list(this.body), this.rbracket]
  next = () => [this.body]
}

export class BooleanLiteral extends Literal {
  type = 'BooleanLiteral'
  value!: string

  print = () => this.value
  next = () => null
}

export class StringLiteral extends Literal {
  type = 'StringLiteral'
  value!: string

  print = () => '"' + this.value + '"'
  next = () => null
}

// TODO: merge with StringLiteral
export class MultilineLiteral extends Literal {
  type = 'MultilineLiteral'
  value!: string

  print = () => this.value
  next = () => null
}

export class DurationLiteral extends Literal {
  type = 'DurationLiteral'
  value!: string

  print = () => this.value
  next = () => null
}

export class NumericLiteral extends Literal {
  type = 'NumericLiteral'
  value!: string

  print = () => this.value
  next = () => null
}

export class IpLiteral extends Literal {
  type = 'IpLiteral'
  value!: string

  print = () => '"' + this.value + '"'
  next = () => null
}

export class Identifier extends Value {
  type = 'Identifier'
  name!: string

  print = () => this.name
  next = () => null
}

export class Header extends Value {
  type = 'Header'
  name!: string

  print = () => this.name
  next = () => null
}

export class MemberExpression extends Value {
  type = 'MemberExpression'
  object!: Identifier
  property!: Identifier | Header | MemberExpression

  print = () => [this.object, '.', this.property]
  next = () => [this.object, this.property]
}

export class BooleanExpression extends Value {
  type = 'BooleanExpression'
  body!: Expression
  lparen!: Mark
  rparen!: Mark

  print = () => [this.lparen, this.body, this.rparen]
  next = () => [this.body]
}

export class UnaryExpression extends Value {
  type = 'UnaryExpression'
  operator!: string
  argument!: Value

  print = () => [this.operator, this.argument]
  next = () => [this.argument]
}

export class FunCallExpression extends Value {
  type = 'FunCallExpression'
  callee!: MemberExpression | Identifier
  arguments!: Array<Expression>
  lparen!: Mark
  rparen!: Mark

  print = () => [
    this.callee,
    this.lparen,
    g.list(this.arguments, ', '),
    this.rparen,
  ]
  next = () => [this.callee, this.arguments]
}

export class ConcatExpression extends Expression {
  type = 'ConcatExpression'
  body!: Array<Value>

  print = () => g.list(this.body)
  next = () => this.body
}

export class BinaryExpression extends Expression {
  type = 'BinaryExpression'
  left!: Expression
  right!: Expression
  operator!: string

  print = () => [this.left, ' ', this.operator, ' ', this.right]
  next = () => [this.left, this.right]
}

export class LogicalExpression extends Expression {
  type = 'LogicalExpression'
  left!: Expression
  right!: Expression
  operator!: string

  print = () => g.list([this.left, this.right], ' ' + this.operator + ' ')
  next = () => [this.left, this.right]
}

export class ExpressionStatement extends Statement {
  type = 'ExpressionStatement'
  body!: Expression

  print = () => [this.body, ';']
  next = () => [this.body]
}

export class IncludeStatement extends Statement {
  type = 'IncludeStatement'
  module!: StringLiteral

  print = () => ['include', ' ', this.module, ';']
  next = () => [this.module]
}
export class ImportStatement extends Statement {
  type = 'ImportStatement'
  module!: Identifier

  print = () => ['import', ' ', this.module, ';']
  next = () => [this.module]
}

export class CallStatement extends Statement {
  type = 'CallStatement'
  subroutine!: Identifier

  print = () => ['call', ' ', this.subroutine, ';']
  next = () => [this.subroutine]
}

export type ValueType = 'STRING' | 'BOOL' | 'BOOLEAN' | 'INTEGER' | 'FLOAT'

export class DeclareStatement extends Statement {
  type = 'DeclareStatement'
  id!: Identifier | MemberExpression
  valueType!: ValueType

  print = () => [
    'declare',
    ' ',
    'local',
    ' ',
    this.id,
    ' ',
    this.valueType,
    ';',
  ]
  next = () => [this.id]
}

export class AddStatement extends Statement {
  type = 'AddStatement'
  left!: Identifier | MemberExpression
  right!: Expression
  operator!: string

  print = () => [
    'add',
    ' ',
    this.left,
    ' ',
    this.operator,
    ' ',
    this.right,
    ';',
  ]
  next = () => [this.left, this.right]
}

export class SetStatement extends Statement {
  type = 'SetStatement'
  left!: Identifier | MemberExpression
  right!: Expression
  operator!: string

  print = () => [
    'set',
    ' ',
    this.left,
    ' ',
    this.operator,
    ' ',
    this.right,
    ';',
  ]
  next = () => [this.left, this.right]
}

export class UnsetStatement extends Statement {
  type = 'UnsetStatement'
  id!: Identifier | MemberExpression

  print = () => ['unset', ' ', this.id, ';']
  next = () => [this.id]
}
export type ReturnAction =
  | 'pass'
  | 'hit_for_pass'
  | 'lookup'
  | 'pipe'
  | 'deliver'

export class ReturnStatement extends Statement {
  type = 'ReturnStatement'
  action!: ReturnAction

  print = () => ['return', ' ', '(', this.action, ');']
  next = () => null
}

export class ErrorStatement extends Statement {
  type = 'ErrorStatement'
  status!: Literal
  message?: Expression

  print = () =>
    this.message
      ? ['error', ' ', this.status, ' ', this.message, ';']
      : ['error', ' ', this.status, ';']
  next = () => (this.message ? [this.status, this.message] : [this.status])
}

export class RestartStatement extends Statement {
  type = 'RestartStatement'

  print = () => ['restart;']
  next = () => null
}

export class SyntheticStatement extends Statement {
  type = 'SyntheticStatement'
  response!: Expression

  print = () => ['synthetic', ' ', this.response, ';']
  next = () => [this.response]
}

export class LogStatement extends Statement {
  type = 'LogStatement'
  content!: Expression

  print = () => ['log', ' ', this.content, ';']
  next = () => [this.content]
}

export class IfStatement extends Statement {
  type = 'IfStatement'
  test!: Expression
  consequent!: Block
  alternative?: IfStatement | Block
  lparen!: Mark
  rparen!: Mark

  print = (): Array<Printable> =>
    this.alternative
      ? [
          'if',
          ' ',
          this.lparen,
          this.test,
          this.rparen,
          ' ',
          this.consequent,
          ' ',
          'else',
          ' ',
          this.alternative,
        ]
      : ['if', ' ', this.lparen, this.test, this.rparen, ' ', this.consequent]
  next = (): Array<Node> =>
    this.alternative
      ? [this.test, this.consequent, this.alternative]
      : [this.test, this.consequent]
}

export class SubroutineStatement extends Statement {
  type = 'SubroutineStatement'
  id!: Identifier
  body!: Block

  print = () => ['sub', ' ', this.id, ' ', this.body]
  next = () => [this.id, this.body]
}

export class AclStatement extends Statement {
  type = 'AclStatement'
  id!: Identifier
  body!: Array<IpLiteral>
  lbracket!: Mark
  rbracket!: Mark

  print = () => [
    'acl',
    ' ',
    this.id,
    ' ',
    this.lbracket,
    g.list(this.body, ';'),
    this.rbracket,
  ]
  next = () => [this.id, this.body]
}

export class CustomStatement extends Statement {
  type = 'CustomStatement'
  directive!: string
  body!: Array<Node>

  print = () => [this.directive, ' ', g.list(this.body, ' '), ';']
  next = () => this.body
}

export class StructDefinitionExpression extends Expression {
  type = 'StructDefinitionExpression'
  body!: Array<MemberAssignStatement>
  lbracket!: Mark
  rbracket!: Mark

  print = (): [Mark, g.PrintList, Mark] => [
    this.lbracket,
    g.list(this.body),
    this.rbracket,
  ]
  next = () => this.body
}

export class MemberAssignStatement extends Statement {
  type = 'MemberAssignStatement'
  id!: Identifier
  value!: Literal | StructDefinitionExpression

  print = (): [
    string,
    Identifier,
    string,
    Literal | StructDefinitionExpression,
    string
  ] => ['.', this.id, ' = ', this.value, ';']
  next = () => [this.id, this.value]
}

export class BackendStatement extends Statement {
  type = 'BackendStatement'
  id!: Identifier
  body!: StructDefinitionExpression

  print = () => ['backend', ' ', this.id, ' ', this.body]
  next = () => [this.id, this.body]
}
