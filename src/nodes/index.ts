import { builders as b } from '../generator'
import { Doc } from 'prettier'
import { flatten } from 'array-flatten'

export interface Position {
  offset: number
  line: number
  column: number
}

export interface Location {
  start: Position
  end: Position
}

const printAst = (n: BaseNode) => n.print()

export type PlainNode<T extends BaseNode> = Omit<T, keyof BaseNode>
export type NodeWithLoc<N extends BaseNode = BaseNode> = N & { loc: Location }

export type NodeClassMap = typeof map
export type NodeType = keyof NodeClassMap
export type NodeMap = {
  [K in keyof NodeClassMap]: InstanceType<NodeClassMap[K]>
}

export type Node =
  | Program
  // abstract base
  | BaseExpression
  | BaseStatement
  // abstract group
  | Literal
  | Expression
  | Statement

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

export abstract class BaseNode {
  type!: string
  loc?: Location

  abstract next(): Array<BaseNode | undefined>
  abstract print(): Doc

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

  next() {
    return this.body
  }

  print() {
    return b.join(b.hardline, this.body.map(printAst))
  }
}

export class BooleanLiteral extends BaseLiteral {
  type = 'BooleanLiteral' as const
  value: string

  constructor(obj: PlainNode<BooleanLiteral>) {
    super()

    this.value = obj.value
  }

  next() {
    return []
  }

  print() {
    return this.value
  }
}

export class StringLiteral extends BaseLiteral {
  type = 'StringLiteral' as const
  value: string

  constructor(obj: PlainNode<StringLiteral>) {
    super()

    this.value = obj.value
  }

  next() {
    return []
  }

  print() {
    return this.value
  }
}

export class MultilineLiteral extends BaseLiteral {
  type = 'MultilineLiteral' as const
  value: string

  constructor(obj: PlainNode<MultilineLiteral>) {
    super()

    this.value = obj.value
  }

  next() {
    return []
  }

  print() {
    return this.value
  }
}

export class DurationLiteral extends BaseLiteral {
  type = 'DurationLiteral' as const
  value: string

  constructor(obj: PlainNode<DurationLiteral>) {
    super()

    this.value = obj.value
  }

  next() {
    return []
  }

  print() {
    return this.value
  }
}

export class NumericLiteral extends BaseLiteral {
  type = 'NumericLiteral' as const
  value: string

  constructor(obj: PlainNode<NumericLiteral>) {
    super()

    this.value = obj.value
  }

  next() {
    return []
  }

  print() {
    return this.value
  }
}

export class Identifier extends BaseExpression {
  type = 'Identifier' as const
  name: string

  constructor(obj: PlainNode<Identifier>) {
    super()

    this.name = obj.name
  }

  next() {
    return []
  }

  print() {
    return this.name
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

  next() {
    return []
  }

  print() {
    return this.cidr ? `"${this.value}"/${this.cidr}` : `"${this.value}"`
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

  next() {
    return [this.base, this.member]
  }

  print() {
    return b.concat([
      printAst(this.base),
      // b.softline,
      '.',
      printAst(this.member),
    ])
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

  next() {
    return [this.base, this.name]
  }

  print() {
    return b.concat([
      printAst(this.base),
      // b.softline,
      ':',
      printAst(this.name),
    ])
  }
}

export class BooleanExpression extends BaseExpression {
  type = 'BooleanExpression' as const
  body: Expression

  constructor(obj: PlainNode<BooleanExpression>) {
    super()

    this.body = obj.body
  }

  next() {
    return [this.body]
  }

  print() {
    return b.concat(['(', b.indent(b.concat([printAst(this.body)])), ')'])
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

  next() {
    return [this.argument]
  }

  print() {
    return b.concat([this.operator, printAst(this.argument)])
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

  next() {
    return [this.callee, ...this.arguments]
  }

  print() {
    return b.concat([
      printAst(this.callee),
      '(',
      b.group(
        b.concat([
          b.indent(
            b.concat([
              b.join(b.concat([',', b.line]), this.arguments.map(printAst)),
            ])
          ),
          b.ifBreak(b.line, ''),
        ])
      ),
      ')',
    ])
  }
}

export class ConcatExpression extends BaseExpression {
  type = 'ConcatExpression' as const
  body: Array<Expression>

  constructor(obj: PlainNode<ConcatExpression>) {
    super()

    this.body = obj.body
  }

  next() {
    return this.body
  }

  print() {
    return b.join(' ', this.body.map(printAst))
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

  next() {
    return [this.left, this.right]
  }

  print() {
    return b.concat([
      printAst(this.left),
      ' ',
      b.concat([this.operator, ' ', printAst(this.right)]),
    ])
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

  next() {
    return [this.left, this.right]
  }

  print() {
    return b.concat([
      printAst(this.left),
      ' ',
      b.concat([this.operator, ' ', printAst(this.right)]),
    ])
  }
}

export class ExpressionStatement extends BaseStatement {
  type = 'ExpressionStatement' as const
  body: Expression

  constructor(obj: PlainNode<ExpressionStatement>) {
    super()

    this.body = obj.body
  }

  next() {
    return [this.body]
  }

  print() {
    return b.concat([printAst(this.body), ';'])
  }
}

export class IncludeStatement extends BaseStatement {
  type = 'IncludeStatement' as const
  module: StringLiteral

  constructor(obj: PlainNode<IncludeStatement>) {
    super()

    this.module = obj.module
  }

  next() {
    return [this.module]
  }

  print() {
    return b.concat(['include ', printAst(this.module), ';'])
  }
}

export class ImportStatement extends BaseStatement {
  type = 'ImportStatement' as const
  module: Identifier

  constructor(obj: PlainNode<ImportStatement>) {
    super()

    this.module = obj.module
  }

  next() {
    return [this.module]
  }

  print() {
    return b.concat(['import ', printAst(this.module), ';'])
  }
}

export class CallStatement extends BaseStatement {
  type = 'CallStatement' as const
  subroutine: Identifier

  constructor(obj: PlainNode<CallStatement>) {
    super()

    this.subroutine = obj.subroutine
  }

  next() {
    return [this.subroutine]
  }

  print() {
    return b.concat(['call ', printAst(this.subroutine), ';'])
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

  next() {
    return [this.id]
  }

  print() {
    return b.concat([
      'declare ',
      'local ',
      printAst(this.id),
      ' ',
      this.valueType,
      ';',
    ])
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

  next() {
    return [this.left, this.right]
  }

  print() {
    return b.concat([
      'add ',
      printAst(this.left),
      ' ',
      this.operator,
      ' ',
      printAst(this.right),
      ';',
    ])
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

  next() {
    return [this.left, this.right]
  }

  print() {
    return b.concat([
      'set ',
      printAst(this.left),
      ' ',
      this.operator,
      ' ',
      printAst(this.right),
      ';',
    ])
  }
}

export class UnsetStatement extends BaseStatement {
  type = 'UnsetStatement' as const
  id: Identifier | Member

  constructor(obj: PlainNode<UnsetStatement>) {
    super()

    this.id = obj.id
  }

  next() {
    return [this.id]
  }

  print() {
    return b.concat(['unset ', printAst(this.id), ';'])
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

  next() {
    return []
  }

  print() {
    // TODO: handle the optional parens
    return b.concat(['return ', '(', this.action, ')', ';'])
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

  next() {
    return [this.message]
  }

  print() {
    return b.concat([
      b.join(
        ' ',
        [
          'error',
          this.status.toString(),
          this.message && printAst(this.message),
        ].filter(Boolean) as Array<Doc>
      ),
      ';',
    ])
  }
}

export class RestartStatement extends BaseStatement {
  type = 'RestartStatement' as const

  constructor(/* obj: PlainNode<RestartStatement> */) {
    super()
  }

  next() {
    return []
  }

  print() {
    return 'restart;'
  }
}

export class SyntheticStatement extends BaseStatement {
  type = 'SyntheticStatement' as const
  response: Expression

  constructor(obj: PlainNode<SyntheticStatement>) {
    super()

    this.response = obj.response
  }

  next() {
    return [this.response]
  }

  print() {
    return b.concat(['synthetic ', printAst(this.response), ';'])
  }
}

export class LogStatement extends BaseStatement {
  type = 'LogStatement' as const
  content: Expression

  constructor(obj: PlainNode<LogStatement>) {
    super()

    this.content = obj.content
  }

  next() {
    return [this.content]
  }

  print() {
    return b.concat(['log ', printAst(this.content), ';'])
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

  next() {
    return flatten(
      [this.test, ...this.consequent, this.alternative].filter(Boolean)
    )
  }

  print() {
    const doc: Array<Doc> = [
      'if ',
      '(',
      printAst(this.test),
      ') ',
      '{',
      b.indent(
        b.concat([
          b.hardline,
          b.join(b.hardline, this.consequent.map(printAst)),
        ])
      ),
      b.hardline,
      '}',
    ]

    if (this.alternative) {
      const alternative = Array.isArray(this.alternative)
        ? [
            ' else {',
            b.indent(
              b.concat([b.hardline, b.concat(this.alternative.map(printAst))])
            ),
            b.hardline,
            '}',
          ]
        : [' else ', printAst(this.alternative)]

      return b.concat([...doc, ...alternative])
    }

    return b.concat(doc)
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

  next() {
    return [this.id, ...this.body]
  }

  print() {
    return b.concat([
      'sub ',
      printAst(this.id),
      ' {',
      b.indent(
        b.concat([b.hardline, b.join(b.hardline, this.body.map(printAst))])
      ),
      b.hardline,
      '}',
    ])
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

  next() {
    return [this.id, ...this.body]
  }

  print() {
    return b.concat([
      'acl ',
      printAst(this.id),
      ' {',
      b.indent(
        b.concat([
          b.hardline,
          b.join(
            b.hardline,
            this.body.map(printAst).map((ip) => b.concat([ip, ';']))
          ),
        ])
      ),
      b.hardline,
      '}',
    ])
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

  next() {
    return Array.isArray(this.value)
      ? this.value.map((d) => d.value as Expression)
      : [this.value]
  }

  print(): Doc {
    const printedValue = Array.isArray(this.value)
      ? b.concat([
          '{',
          b.indent(
            b.concat([
              b.hardline,
              b.join(
                b.hardline,
                this.value.map((v) => v.print())
              ),
            ])
          ),
          b.hardline,
          '}',
        ])
      : b.concat([this.value.print(), ';'])

    return b.concat(['.', this.key, ' = ', printedValue])
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

  next() {
    const bodies = flatten(
      this.body.map((b) =>
        Array.isArray(b.value) ? b.value.map((def) => def.value) : b.value
      )
    )

    bodies.unshift(this.id)

    return bodies
  }

  print() {
    return b.concat([
      'backend ',
      printAst(this.id),
      ' ',
      b.concat([
        '{',
        b.indent(
          b.concat([
            b.hardline,
            b.join(
              b.hardline,
              this.body.map((d) => d.print())
            ),
          ])
        ),
        b.hardline,
        '}',
      ]),
    ])
  }
}

export interface TableDef {
  key: string
  value: string
}

export class TableStatement extends BaseStatement {
  type = 'TableStatement' as const
  id: Identifier
  body: Array<TableDef>

  constructor(obj: PlainNode<TableStatement>) {
    super()

    this.id = obj.id
    this.body = obj.body
  }

  next() {
    return [this.id]
  }

  print() {
    return b.concat([
      'table ',
      printAst(this.id),
      ' {',
      b.indent(
        b.concat([
          b.hardline,
          b.join(
            b.concat([',', b.hardline]),
            this.body.map((td) => b.concat([td.key, ':', td.value]))
          ),
          // TODO: handle trailing comma
          // ',',
        ])
      ),
      b.hardline,
      '}',
    ])
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
  TableStatement,
} as const
