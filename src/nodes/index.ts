import { Token } from '../parser/tokenizer'
import { builders as b } from '../generator'
import { Doc } from 'prettier'

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
  | File
  | Program
  | Comment
  | Block
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

export class File extends BaseNode {
  type = 'File' as const
  filePath: string
  program: Program
  comments: Array<Token>

  constructor(obj: PlainNode<File>) {
    super()

    this.filePath = obj.filePath
    this.program = obj.program
    this.comments = obj.comments
  }

  next() {
    return [this.program]
  }

  print() {
    return printAst(this.program)
  }
}

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

export class Comment extends BaseNode {
  type = 'Comment' as const
  // TODO: add `type` prop
  body: string

  constructor(obj: PlainNode<Comment>) {
    super()

    this.body = obj.body
  }

  next() {
    return []
  }

  print() {
    return this.body
  }
}

export class Block extends BaseNode {
  type = 'Block' as const
  body: Array<Statement>

  constructor(obj: PlainNode<Block>) {
    super()

    this.body = obj.body
  }

  next() {
    return this.body
  }

  print() {
    return b.concat(['{', b.join(b.hardline, this.body.map(printAst)), '}'])
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

export class Header extends BaseExpression {
  type = 'Header' as const
  name: string

  constructor(obj: PlainNode<Header>) {
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
    return this.cidr ? `${this.value}/${this.cidr}` : this.value
  }
}

export class Member extends BaseExpression {
  type = 'Member' as const
  base: Identifier | Member
  member: Identifier | Header

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
    return b.concat([
      '(',
      b.indent(b.concat([b.softline, printAst(this.body)])),
      b.softline,
      ')',
    ])
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
  callee: Member | Identifier
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
      b.softline,
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
    return b.join(b.line, this.body.map(printAst))
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
      b.concat([this.operator, b.line, printAst(this.right)]),
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
    return b.concat([printAst(this.module), ';'])
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

export class DeclareStatement extends BaseStatement {
  type = 'DeclareStatement' as const
  id: Identifier | Member
  valueType: 'STRING' | 'BOOL' | 'BOOLEAN' | 'INTEGER' | 'FLOAT'

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

export class ReturnStatement extends BaseStatement {
  type = 'ReturnStatement' as const
  action: 'pass' | 'hit_for_pass' | 'lookup' | 'pipe' | 'deliver'

  constructor(obj: PlainNode<ReturnStatement>) {
    super()

    this.action = obj.action
  }

  next() {
    return []
  }

  print() {
    return b.concat(['return', this.action, ';'])
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
      'error',
      this.status.toString(),
      this.message && printAst(this.message),
      ';',
    ].filter(Boolean) as Doc[])
  }
}

export class RestartStatement extends BaseStatement {
  type = 'RestartStatement' as const

  constructor(obj: PlainNode<RestartStatement>) {
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
    return b.concat(['synthetic', printAst(this.response), ';'])
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
    return b.concat(['log', printAst(this.content), ';'])
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
    return [this.test, ...this.consequent, this.alternative]
      .filter(Boolean)
      .flat(2)
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
        ? ['else', ...this.alternative.map(printAst)]
        : ['else', '{', printAst(this.alternative), '}']

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
      'acl',
      printAst(this.id),
      b.join(b.hardline, this.body.map(printAst)),
      ';',
    ])
  }
}

export type BackendDef = {
  key: string
  value: Expression | Array<BackendDef>
}

export class BackendStatement extends BaseStatement {
  type = 'BackendStatement' as const
  id: Identifier
  body: Array<BackendDef>

  constructor(obj: PlainNode<BackendStatement>) {
    super()

    this.id = obj.id
    this.body = obj.body
  }

  next() {
    return this.body
      .filter((b) => b.value instanceof BaseNode)
      .map((b) => b.value)
      .flat(2)
  }

  static printDef(def: BackendDef): Doc {
    const value = Array.isArray(def.value)
      ? this.printBody(def.value)
      : b.concat([def.value.print(), ';'])

    return b.concat(['.', def.key, ' = ', value])
  }

  static printBody(defs: Array<BackendDef>): Doc {
    return b.concat([
      '{',
      b.indent(
        b.concat([b.hardline, b.join(b.hardline, defs.map(this.printDef))])
      ),
      b.hardline,
      '}',
    ])
  }

  print() {
    return b.concat([
      'backend ',
      printAst(this.id),
      ' ',
      BackendStatement.printBody(this.body),
    ])
  }
}

export type TableDef = { key: string; value: string }

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
      'table',
      printAst(this.id),
      b.join(
        b.hardline,
        this.body.map((td) => b.concat([td.key, ':', td.value]))
      ),
    ])
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
