export interface Position {
  offset: number
  line: number
  column: number
}

export interface Location {
  start: Position
  end: Position
}

export type PlainNode<T extends BaseNode> = Omit<T, keyof BaseNode>
export type NodeWithLoc<N extends BaseNode = BaseNode> = N & { loc: Location }

export type NodeClassMap = typeof map
export type NodeType = keyof NodeClassMap
export type NodeMap = {
  [K in keyof NodeClassMap]: InstanceType<NodeClassMap[K]>
}

export type Node = Program | Literal | Expression | Statement

export type Literal =
  | BooleanLiteral
  | StringLiteral
  | MultilineLiteral
  | DurationLiteral
  | NumericLiteral

export type Expression =
  | Literal
  | Identifier
  | Ip
  | Member
  | ValuePair
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
  | BackendStatement
  | TableStatement

const flat = <T>(arr: Array<T>) =>
  arr.reduce((acc, cur) => acc.concat(cur), [] as Array<T>)

export abstract class BaseNode {
  type!: string
  loc?: Location

  next(): Array<Node> {
    return flat(
      Object.values(this).filter(
        (v) => Array.isArray(v) || v instanceof BaseNode
      )
    )
  }

  static build<T extends NodeType, N extends NodeMap[T]>(
    node: N,
    values: PlainNode<N>
  ): N {
    Object.setPrototypeOf(node, this.prototype)
    Object.assign(node, values)

    return node
  }
}

export abstract class BaseExpression extends BaseNode {}
export abstract class BaseLiteral extends BaseExpression {}
export abstract class BaseStatement extends BaseNode {}

export class Program extends BaseNode {
  type = 'Program' as const
  body: Array<Statement>

  constructor(obj: PlainNode<Program>) {
    super()

    this.body = obj.body
  }
}

export class BooleanLiteral extends BaseLiteral {
  type = 'BooleanLiteral' as const
  value: string

  constructor(obj: PlainNode<BooleanLiteral>) {
    super()

    this.value = obj.value
  }
}

export class StringLiteral extends BaseLiteral {
  type = 'StringLiteral' as const
  value: string

  constructor(obj: PlainNode<StringLiteral>) {
    super()

    this.value = obj.value
  }
}

export class MultilineLiteral extends BaseLiteral {
  type = 'MultilineLiteral' as const
  value: string

  constructor(obj: PlainNode<MultilineLiteral>) {
    super()

    this.value = obj.value
  }
}

export class DurationLiteral extends BaseLiteral {
  type = 'DurationLiteral' as const
  value: string

  constructor(obj: PlainNode<DurationLiteral>) {
    super()

    this.value = obj.value
  }
}

export class NumericLiteral extends BaseLiteral {
  type = 'NumericLiteral' as const
  value: string

  constructor(obj: PlainNode<NumericLiteral>) {
    super()

    this.value = obj.value
  }
}

export class Identifier extends BaseExpression {
  type = 'Identifier' as const
  name: string

  constructor(obj: PlainNode<Identifier>) {
    super()

    this.name = obj.name
  }
}

export class Ip extends BaseExpression {
  type = 'Ip' as const
  value: string
  cidr?: number

  constructor(obj: PlainNode<Ip>) {
    super()

    this.value = obj.value
    this.cidr = obj.cidr
  }
}

export class Member extends BaseExpression {
  type = 'Member' as const
  base: Identifier | Member
  member: Identifier

  constructor(obj: PlainNode<Member>) {
    super()

    this.base = obj.base
    this.member = obj.member
  }
}

export class ValuePair extends BaseExpression {
  type = 'ValuePair' as const
  base: Identifier | Member
  name: Identifier

  constructor(obj: PlainNode<ValuePair>) {
    super()

    this.base = obj.base
    this.name = obj.name
  }
}

export class BooleanExpression extends BaseExpression {
  type = 'BooleanExpression' as const
  body: Expression

  constructor(obj: PlainNode<BooleanExpression>) {
    super()

    this.body = obj.body
  }
}

export class UnaryExpression extends BaseExpression {
  type = 'UnaryExpression' as const
  operator: string
  argument: Expression

  constructor(obj: PlainNode<UnaryExpression>) {
    super()

    this.operator = obj.operator
    this.argument = obj.argument
  }
}

export class FunCallExpression extends BaseExpression {
  type = 'FunCallExpression' as const
  callee: Member | Identifier | ValuePair
  arguments: Array<Expression>

  constructor(obj: PlainNode<FunCallExpression>) {
    super()

    this.callee = obj.callee
    this.arguments = obj.arguments
  }
}

export class ConcatExpression extends BaseExpression {
  type = 'ConcatExpression' as const
  body: Array<Expression>

  constructor(obj: PlainNode<ConcatExpression>) {
    super()

    this.body = obj.body
  }
}

export class BinaryExpression extends BaseExpression {
  type = 'BinaryExpression' as const
  left: Expression
  right: Expression
  operator: string

  constructor(obj: PlainNode<BinaryExpression>) {
    super()

    this.left = obj.left
    this.right = obj.right
    this.operator = obj.operator
  }
}

export class LogicalExpression extends BaseExpression {
  type = 'LogicalExpression' as const
  left: Expression
  right: Expression
  operator: string

  constructor(obj: PlainNode<LogicalExpression>) {
    super()

    this.left = obj.left
    this.right = obj.right
    this.operator = obj.operator
  }
}

export class ExpressionStatement extends BaseStatement {
  type = 'ExpressionStatement' as const
  body: Expression

  constructor(obj: PlainNode<ExpressionStatement>) {
    super()

    this.body = obj.body
  }
}

export class IncludeStatement extends BaseStatement {
  type = 'IncludeStatement' as const
  module: StringLiteral

  constructor(obj: PlainNode<IncludeStatement>) {
    super()

    this.module = obj.module
  }
}

export class ImportStatement extends BaseStatement {
  type = 'ImportStatement' as const
  module: Identifier

  constructor(obj: PlainNode<ImportStatement>) {
    super()

    this.module = obj.module
  }
}

export class CallStatement extends BaseStatement {
  type = 'CallStatement' as const
  subroutine: Identifier

  constructor(obj: PlainNode<CallStatement>) {
    super()

    this.subroutine = obj.subroutine
  }
}

export type DeclareValueType =
  | 'STRING'
  | 'BOOL'
  | 'BOOLEAN'
  | 'INTEGER'
  | 'FLOAT'

export class DeclareStatement extends BaseStatement {
  type = 'DeclareStatement' as const
  id: Identifier | Member
  valueType: DeclareValueType

  constructor(obj: PlainNode<DeclareStatement>) {
    super()

    this.id = obj.id
    this.valueType = obj.valueType
  }
}

export class AddStatement extends BaseStatement {
  type = 'AddStatement' as const
  left: Identifier | Member
  right: Expression
  operator: string

  constructor(obj: PlainNode<AddStatement>) {
    super()

    this.left = obj.left
    this.right = obj.right
    this.operator = obj.operator
  }
}

export class SetStatement extends BaseStatement {
  type = 'SetStatement' as const
  left: Identifier | Member
  right: Expression
  operator: string

  constructor(obj: PlainNode<SetStatement>) {
    super()

    this.left = obj.left
    this.right = obj.right
    this.operator = obj.operator
  }
}

export class UnsetStatement extends BaseStatement {
  type = 'UnsetStatement' as const
  id: Identifier | Member

  constructor(obj: PlainNode<UnsetStatement>) {
    super()

    this.id = obj.id
  }
}

export type ReturnActionName =
  | 'pass'
  | 'hit_for_pass'
  | 'lookup'
  | 'pipe'
  | 'deliver'

export class ReturnStatement extends BaseStatement {
  type = 'ReturnStatement' as const
  action: ReturnActionName

  constructor(obj: PlainNode<ReturnStatement>) {
    super()

    this.action = obj.action
  }
}

export class ErrorStatement extends BaseStatement {
  type = 'ErrorStatement' as const
  status: number
  message?: Expression

  constructor(obj: PlainNode<ErrorStatement>) {
    super()

    this.status = obj.status
    this.message = obj.message
  }
}

export class RestartStatement extends BaseStatement {
  type = 'RestartStatement' as const

  constructor(/* obj: PlainNode<RestartStatement> */) {
    super()
  }
}

export class SyntheticStatement extends BaseStatement {
  type = 'SyntheticStatement' as const
  response: Expression

  constructor(obj: PlainNode<SyntheticStatement>) {
    super()

    this.response = obj.response
  }
}

export class LogStatement extends BaseStatement {
  type = 'LogStatement' as const
  content: Expression

  constructor(obj: PlainNode<LogStatement>) {
    super()

    this.content = obj.content
  }
}

export class IfStatement extends BaseStatement {
  type = 'IfStatement' as const
  test: Expression
  consequent: Array<Statement>
  alternative?: IfStatement | Array<Statement>

  constructor(obj: PlainNode<IfStatement>) {
    super()

    this.test = obj.test
    this.consequent = obj.consequent
    this.alternative = obj.alternative
  }
}

export class SubroutineStatement extends BaseStatement {
  type = 'SubroutineStatement' as const
  id: Identifier
  body: Array<Statement>

  constructor(obj: PlainNode<SubroutineStatement>) {
    super()

    this.id = obj.id
    this.body = obj.body
  }
}

export class AclStatement extends BaseStatement {
  type = 'AclStatement' as const
  id: Identifier
  body: Array<Ip>

  constructor(obj: PlainNode<AclStatement>) {
    super()

    this.id = obj.id
    this.body = obj.body
  }
}

export class BackendDefinition extends BaseNode {
  type = 'BackendDefinition' as const
  key: string
  value: Expression | Array<BackendDefinition>

  constructor(obj: PlainNode<BackendDefinition>) {
    super()

    this.key = obj.key
    this.value = obj.value
  }
}

export class BackendStatement extends BaseStatement {
  type = 'BackendStatement' as const
  id: Identifier
  body: Array<BackendDefinition>

  constructor(obj: PlainNode<BackendStatement>) {
    super()

    this.id = obj.id
    this.body = obj.body
  }
}

export class TableDefinition extends BaseNode {
  type = 'TableDefinition' as const
  key: string
  value: string

  constructor(obj: PlainNode<TableDefinition>) {
    super()

    this.key = obj.key
    this.value = obj.value
  }
}

export class TableStatement extends BaseStatement {
  type = 'TableStatement' as const
  id: Identifier
  body: Array<TableDefinition>

  constructor(obj: PlainNode<TableStatement>) {
    super()

    this.id = obj.id
    this.body = obj.body
  }
}

export const map = {
  Program,
  BooleanLiteral,
  StringLiteral,
  MultilineLiteral,
  DurationLiteral,
  NumericLiteral,
  Identifier,
  Ip,
  Member,
  ValuePair,
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
  BackendDefinition,
  BackendStatement,
  TableDefinition,
  TableStatement,
} as const
