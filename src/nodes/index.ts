import { Token } from '../parser/tokenizer'

export interface Position {
  offset: number
  line: number
  column: number
}

export interface Location {
  start: Position
  end: Position
}

export type PlainNode<T extends Node> = Omit<T, keyof Node>
export type NodeWithLoc<N extends Node = Node> = N & { loc: Location }
export type NodeMap = typeof map
export type NodeType = keyof NodeMap

export abstract class Node {
  type!: string
  loc?: Location

  constructor() {}

  abstract next(): Array<Node | undefined>

  static create<T extends NodeType, U extends InstanceType<NodeMap[T]>>(
    type: T,
    values: PlainNode<U>,
    loc?: Location
  ): U {
    const node = new map[type](values)

    if (loc) {
      node.loc = loc
    }

    return node as U
  }

  static build<T extends NodeType, N extends InstanceType<NodeMap[T]>>(
    node: NodeWithLoc,
    type: T,
    values: PlainNode<N>
  ): NodeWithLoc<N> {
    node.type = type
    Object.assign(node, values)

    Object.setPrototypeOf(node, map[type].prototype)

    return node as NodeWithLoc<N>
  }
}

export abstract class Literal extends Node {}
export abstract class Expression extends Node {}
export abstract class Statement extends Node {}

export class File extends Node {
  type = 'File' as const
  filePath: string
  program: Program
  comments: Array<Token>

  constructor(obj: any) {
    super()

    this.filePath = obj.filePath
    this.program = obj.program
    this.comments = obj.comments
  }

  next() {
    return [this.program]
  }
}

export class Program extends Node {
  type = 'Program' as const
  body: Array<Statement | Comment>

  constructor(obj: any) {
    super()

    this.body = obj.body
  }

  next() {
    return this.body
  }
}

export class Comment extends Node {
  type = 'Comment' as const
  // TODO: add `type` prop
  body: string

  constructor(obj: any) {
    super()

    this.body = obj.body
  }

  next() {
    return []
  }
}

export class Block extends Node {
  type = 'Block' as const
  body: Array<Statement | Comment>

  constructor(obj: any) {
    super()

    this.body = obj.body
  }

  next() {
    return this.body
  }
}

export class BooleanLiteral extends Literal {
  type = 'BooleanLiteral' as const
  value: string

  constructor(obj: any) {
    super()

    this.value = obj.value
  }

  next() {
    return []
  }
}

export class StringLiteral extends Literal {
  type = 'StringLiteral' as const
  value: string

  constructor(obj: any) {
    super()

    this.value = obj.value
  }

  next() {
    return []
  }
}

export class MultilineLiteral extends Literal {
  type = 'MultilineLiteral' as const
  value: string

  constructor(obj: any) {
    super()

    this.value = obj.value
  }

  next() {
    return []
  }
}

export class DurationLiteral extends Literal {
  type = 'DurationLiteral' as const
  value: string

  constructor(obj: any) {
    super()

    this.value = obj.value
  }

  next() {
    return []
  }
}

export class NumericLiteral extends Literal {
  type = 'NumericLiteral' as const
  value: string

  constructor(obj: any) {
    super()

    this.value = obj.value
  }

  next() {
    return []
  }
}

export class Identifier extends Expression {
  type = 'Identifier' as const
  name: string

  constructor(obj: PlainNode<Identifier>) {
    super()

    this.name = obj.name
  }

  next() {
    return []
  }
}

export class Header extends Expression {
  type = 'Header' as const
  name: string

  constructor(obj: any) {
    super()

    this.name = obj.name
  }

  next() {
    return []
  }
}

export class Ip extends Expression {
  type = 'Ip' as const
  value: string
  cidr?: number

  constructor(obj: any) {
    super()

    this.value = obj.value
    this.cidr = obj.cidr
  }

  next() {
    return []
  }
}

export class Member extends Expression {
  type = 'Member' as const
  base: Identifier | Member
  member: Identifier | Header

  constructor(obj: any) {
    super()

    this.base = obj.base
    this.member = obj.member
  }

  next() {
    return [this.base, this.member]
  }
}

export class BooleanExpression extends Expression {
  type = 'BooleanExpression' as const
  body: Expression

  constructor(obj: any) {
    super()

    this.body = obj.body
  }

  next() {
    return [this.body]
  }
}

export class UnaryExpression extends Expression {
  type = 'UnaryExpression' as const
  operator: string
  argument: Expression

  constructor(obj: any) {
    super()

    this.operator = obj.operator
    this.argument = obj.argument
  }

  next() {
    return [this.argument]
  }
}

export class FunCallExpression extends Expression {
  type = 'FunCallExpression' as const
  callee: Member | Identifier
  arguments: Array<Expression>

  constructor(obj: any) {
    super()

    this.callee = obj.callee
    this.arguments = obj.arguments
  }

  next() {
    return []
  }
}

export class ConcatExpression extends Expression {
  type = 'ConcatExpression' as const
  body: Array<Expression>

  constructor(obj: any) {
    super()

    this.body = obj.body
  }

  next() {
    return this.body
  }
}

export class BinaryExpression extends Expression {
  type = 'BinaryExpression' as const
  left: Expression
  right: Expression
  operator: string

  constructor(obj: any) {
    super()

    this.left = obj.left
    this.right = obj.right
    this.operator = obj.operator
  }

  next() {
    return [this.left, this.right]
  }
}

export class LogicalExpression extends Expression {
  type = 'LogicalExpression' as const
  left: Expression
  right: Expression
  operator: string

  constructor(obj: any) {
    super()

    this.left = obj.left
    this.right = obj.right
    this.operator = obj.operator
  }

  next() {
    return [this.left, this.right]
  }
}

export class ExpressionStatement extends Statement {
  type = 'ExpressionStatement' as const
  body: Expression

  constructor(obj: any) {
    super()

    this.body = obj.body
  }

  next() {
    return [this.body]
  }
}

export class IncludeStatement extends Statement {
  type = 'IncludeStatement' as const
  module: StringLiteral

  constructor(obj: any) {
    super()

    this.module = obj.module
  }

  next() {
    return [this.module]
  }
}

export class ImportStatement extends Statement {
  type = 'ImportStatement' as const
  module: Identifier

  constructor(obj: any) {
    super()

    this.module = obj.module
  }

  next() {
    return [this.module]
  }
}

export class CallStatement extends Statement {
  type = 'CallStatement' as const
  subroutine: Identifier

  constructor(obj: any) {
    super()

    this.subroutine = obj.subroutine
  }

  next() {
    return [this.subroutine]
  }
}

export class DeclareStatement extends Statement {
  type = 'DeclareStatement' as const
  id: Identifier | Member
  valueType: 'STRING' | 'BOOL' | 'BOOLEAN' | 'INTEGER' | 'FLOAT'

  constructor(obj: any) {
    super()

    this.id = obj.id
    this.valueType = obj.valueType
  }

  next() {
    return [this.id]
  }
}

export class AddStatement extends Statement {
  type = 'AddStatement' as const
  left: Identifier | Member
  right: Expression
  operator: string

  constructor(obj: any) {
    super()

    this.left = obj.left
    this.right = obj.right
    this.operator = obj.operator
  }

  next() {
    return [this.left, this.right]
  }
}

export class SetStatement extends Statement {
  type = 'SetStatement' as const
  left: Identifier | Member
  right: Expression
  operator: string

  constructor(obj: any) {
    super()

    this.left = obj.left
    this.right = obj.right
    this.operator = obj.operator
  }

  next() {
    return [this.left, this.right]
  }
}

export class UnsetStatement extends Statement {
  type = 'UnsetStatement' as const
  id: Identifier | Member

  constructor(obj: any) {
    super()

    this.id = obj.id
  }

  next() {
    return [this.id]
  }
}

export class ReturnStatement extends Statement {
  type = 'ReturnStatement' as const
  action: 'pass' | 'hit_for_pass' | 'lookup' | 'pipe' | 'deliver'

  constructor(obj: any) {
    super()

    this.action = obj.action
  }

  next() {
    return []
  }
}

export class ErrorStatement extends Statement {
  type = 'ErrorStatement' as const
  status: number
  message?: Expression

  constructor(obj: any) {
    super()

    this.status = obj.status
    this.message = obj.message
  }

  next() {
    return [this.message]
  }
}

export class RestartStatement extends Statement {
  type = 'RestartStatement' as const

  constructor(obj: any) {
    super()
  }

  next() {
    return []
  }
}

export class SyntheticStatement extends Statement {
  type = 'SyntheticStatement' as const
  response: Expression

  constructor(obj: any) {
    super()

    this.response = obj.response
  }

  next() {
    return [this.response]
  }
}

export class LogStatement extends Statement {
  type = 'LogStatement' as const
  content: Expression

  constructor(obj: any) {
    super()

    this.content = obj.content
  }

  next() {
    return [this.content]
  }
}

export class IfStatement extends Statement {
  type = 'IfStatement' as const
  test: Expression
  consequent: Array<Statement>
  alternative?: IfStatement | Array<Statement>

  constructor(obj: any) {
    super()

    this.test = obj.test
    this.consequent = obj.consequent
    this.alternative = obj.alternative
  }

  next() {
    return [this.test, ...this.consequent, this.alternative]
      .filter(Boolean)
      .flat(2)
  }
}

export class SubroutineStatement extends Statement {
  type = 'SubroutineStatement' as const
  id: Identifier
  body: Array<Statement>

  constructor(obj: any) {
    super()

    this.id = obj.id
    this.body = obj.body
  }

  next() {
    return [this.id, ...this.body]
  }
}

export class AclStatement extends Statement {
  type = 'AclStatement' as const
  id: Identifier
  body: Array<Ip>

  constructor(obj: any) {
    super()

    this.id = obj.id
    this.body = obj.body
  }

  next() {
    return [this.id, ...this.body]
  }
}

export type BackendDef = {
  key: string
  value: Expression | Array<BackendDef>
}

export class BackendStatement extends Statement {
  type = 'BackendStatement' as const
  id: Identifier
  body: Array<BackendDef>

  constructor(obj: any) {
    super()

    this.id = obj.id
    this.body = obj.body
  }

  next() {
    return this.body.map((b) => b.value).flat(2)
  }
}

export type TableDef = { key: string; value: string }

export class TableStatement extends Statement {
  type = 'TableStatement' as const
  id: Identifier
  body: Array<TableDef>

  constructor(obj: any) {
    super()

    this.id = obj.id
    this.body = obj.body
  }

  next() {
    return [this.id]
  }
}

export const map = {
  File,
  Program,
  Comment,
  Block,
  BooleanLiteral,
  StringLiteral,
  MultilineLiteral,
  DurationLiteral,
  NumericLiteral,
  Identifier,
  Header,
  Ip,
  Member,
  BooleanExpression,
  UnaryExpression,
  FunCallExpression,
  ConcatExpression,
  BinaryExpression,
  LogicalExpression,
  ExpressionStatement,
  IncludeStatement,
  ImportStatement,
  CallStatement,
  DeclareStatement,
  AddStatement,
  SetStatement,
  UnsetStatement,
  ReturnStatement,
  ErrorStatement,
  RestartStatement,
  SyntheticStatement,
  LogStatement,
  IfStatement,
  SubroutineStatement,
  AclStatement,
  BackendStatement,
  TableStatement,
} as const
