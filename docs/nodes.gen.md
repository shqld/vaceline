- [Program](Program)
- [BooleanLiteral](BooleanLiteral)
- [StringLiteral](StringLiteral)
- [MultilineLiteral](MultilineLiteral)
- [DurationLiteral](DurationLiteral)
- [NumericLiteral](NumericLiteral)
- [Identifier](Identifier)
- [Ip](Ip)
- [Member](Member)
- [ValuePair](ValuePair)
- [BooleanExpression](BooleanExpression)
- [UnaryExpression](UnaryExpression)
- [FunCallExpression](FunCallExpression)
- [ConcatExpression](ConcatExpression)
- [BinaryExpression](BinaryExpression)
- [LogicalExpression](LogicalExpression)
- [ExpressionStatement](ExpressionStatement)
- [IncludeStatement](IncludeStatement)
- [ImportStatement](ImportStatement)
- [CallStatement](CallStatement)
- [DeclareStatement](DeclareStatement)
- [AddStatement](AddStatement)
- [SetStatement](SetStatement)
- [UnsetStatement](UnsetStatement)
- [ReturnStatement](ReturnStatement)
- [ErrorStatement](ErrorStatement)
- [RestartStatement](RestartStatement)
- [SyntheticStatement](SyntheticStatement)
- [LogStatement](LogStatement)
- [IfStatement](IfStatement)
- [SubroutineStatement](SubroutineStatement)
- [AclStatement](AclStatement)
- [BackendDefinition](BackendDefinition)
- [BackendStatement](BackendStatement)
- [TableDefinition](TableDefinition)
- [TableStatement](TableStatement)

## Program

```tsx
interface Program <: BaseNode {
  type: 'Program'
  body: Array<Statement>
}
```

## BooleanLiteral

```tsx
interface BooleanLiteral <: BaseNode {
  type: 'BooleanLiteral'
  value: string
}
```

## StringLiteral

```tsx
interface StringLiteral <: BaseNode {
  type: 'StringLiteral'
  value: string
}
```

## MultilineLiteral

```tsx
interface MultilineLiteral <: BaseNode {
  type: 'MultilineLiteral'
  value: string
}
```

## DurationLiteral

```tsx
interface DurationLiteral <: BaseNode {
  type: 'DurationLiteral'
  value: string
}
```

## NumericLiteral

```tsx
interface NumericLiteral <: BaseNode {
  type: 'NumericLiteral'
  value: string
}
```

## Identifier

```tsx
interface Identifier <: BaseNode {
  type: 'Identifier'
  name: string
}
```

## Ip

```tsx
interface Ip <: BaseNode {
  type: 'Ip'
  value: string
  cidr?: number
}
```

## Member

```tsx
interface Member <: BaseNode {
  type: 'Member'
  base: Identifier | Member
  member: Identifier
}
```

## ValuePair

```tsx
interface ValuePair <: BaseNode {
  type: 'ValuePair'
  base: Identifier | Member
  name: Identifier
}
```

## BooleanExpression

```tsx
interface BooleanExpression <: BaseNode {
  type: 'BooleanExpression'
  body: Expression
}
```

## UnaryExpression

```tsx
interface UnaryExpression <: BaseNode {
  type: 'UnaryExpression'
  operator: string
  argument: Expression
}
```

## FunCallExpression

```tsx
interface FunCallExpression <: BaseNode {
  type: 'FunCallExpression'
  callee: Member | Identifier | ValuePair
  args: Array<Expression>
}
```

## ConcatExpression

```tsx
interface ConcatExpression <: BaseNode {
  type: 'ConcatExpression'
  body: Array<Expression>
}
```

## BinaryExpression

```tsx
interface BinaryExpression <: BaseNode {
  type: 'BinaryExpression'
  left: Expression
  right: Expression
  operator: string
}
```

## LogicalExpression

```tsx
interface LogicalExpression <: BaseNode {
  type: 'LogicalExpression'
  left: Expression
  right: Expression
  operator: string
}
```

## ExpressionStatement

```tsx
interface ExpressionStatement <: BaseNode {
  type: 'ExpressionStatement'
  body: Expression
}
```

## IncludeStatement

```tsx
interface IncludeStatement <: BaseNode {
  type: 'IncludeStatement'
  module: StringLiteral
}
```

## ImportStatement

```tsx
interface ImportStatement <: BaseNode {
  type: 'ImportStatement'
  module: Identifier
}
```

## CallStatement

```tsx
interface CallStatement <: BaseNode {
  type: 'CallStatement'
  subroutine: Identifier
}
```

## DeclareStatement

```tsx
interface DeclareStatement <: BaseNode {
  type: 'DeclareStatement'
  id: Identifier | Member
  valueType: DeclareValueType
}
```

## AddStatement

```tsx
interface AddStatement <: BaseNode {
  type: 'AddStatement'
  left: Identifier | Member
  right: Expression
  operator: string
}
```

## SetStatement

```tsx
interface SetStatement <: BaseNode {
  type: 'SetStatement'
  left: Identifier | Member
  right: Expression
  operator: string
}
```

## UnsetStatement

```tsx
interface UnsetStatement <: BaseNode {
  type: 'UnsetStatement'
  id: Identifier | Member
}
```

## ReturnStatement

```tsx
interface ReturnStatement <: BaseNode {
  type: 'ReturnStatement'
  action: ReturnActionName
}
```

## ErrorStatement

```tsx
interface ErrorStatement <: BaseNode {
  type: 'ErrorStatement'
  status: number
  message?: Expression
}
```

## RestartStatement

```tsx
interface RestartStatement <: BaseNode {
  type: 'RestartStatement'
}
```

## SyntheticStatement

```tsx
interface SyntheticStatement <: BaseNode {
  type: 'SyntheticStatement'
  response: Expression
}
```

## LogStatement

```tsx
interface LogStatement <: BaseNode {
  type: 'LogStatement'
  content: Expression
}
```

## IfStatement

```tsx
interface IfStatement <: BaseNode {
  type: 'IfStatement'
  test: Expression
  consequent: Array<Statement>
  alternative?: IfStatement | Array<Statement>
}
```

## SubroutineStatement

```tsx
interface SubroutineStatement <: BaseNode {
  type: 'SubroutineStatement'
  id: Identifier
  body: Array<Statement>
}
```

## AclStatement

```tsx
interface AclStatement <: BaseNode {
  type: 'AclStatement'
  id: Identifier
  body: Array<Ip>
}
```

## BackendDefinition

```tsx
interface BackendDefinition <: BaseNode {
  type: 'BackendDefinition'
  key: string
  value: Expression | Array<BackendDefinition>
}
```

## BackendStatement

```tsx
interface BackendStatement <: BaseNode {
  type: 'BackendStatement'
  id: Identifier
  body: Array<BackendDefinition>
}
```

## TableDefinition

```tsx
interface TableDefinition <: BaseNode {
  type: 'TableDefinition'
  key: string
  value: string
}
```

## TableStatement

```tsx
interface TableStatement <: BaseNode {
  type: 'TableStatement'
  id: Identifier
  body: Array<TableDefinition>
}
```
