import { Node } from './node'
import * as n from '../ast-nodes.d'

type ExtractNodeFromDef<Def> = Def extends NodeDef<infer Node> ? Node : never

export type NodeDefMap = typeof nodeDefs
export type NodeType = keyof NodeDefMap
export type NodeAs<T extends NodeType> = ExtractNodeFromDef<NodeDefMap[T]>

export interface NodeDef<T extends Node> {
  build(node: T, obj: Omit<T, keyof Node>): void
  print(node: T): Array<Node | string>
  next(node: T): null | ReadonlyArray<Node>
}

export const nodeDefs = {
  File: {
    build: (n, o) => {
      n.filePath = o.filePath
      n.program = o.program
      n.comments = o.comments
    },
    next: (n) => [n.program],
    print: (n) => [n.program],
  } as NodeDef<n.File>,

  Program: {
    build(node, obj) {
      node.body = obj.body
    },
    next: (node) => node.body,
    print: (n) => n.body,
  } as NodeDef<n.Program>,

  Comment: {
    build(node, obj) {
      node.body = obj.body
    },
    next: () => null,
    print: (n) => [n.body],
  } as NodeDef<n.Comment>,

  Block: {
    build(node, obj) {
      node.body = obj.body
    },
    next: (n) => n.body,
    print: (n) => ['{', ...n.body, '}'],
  } as NodeDef<n.Block>,

  BooleanLiteral: {
    build(node, obj) {
      node.value = obj.value
    },
    next: (n) => null,
    print: (n) => [n.value],
  } as NodeDef<n.BooleanLiteral>,

  StringLiteral: {
    build(node, obj) {
      node.value = obj.value
    },
    next: (n) => null,
    print: (n) => [n.value],
  } as NodeDef<n.StringLiteral>,

  MultilineLiteral: {
    build(node, obj) {
      node.value = obj.value
    },
    next: (n) => null,
    print: (n) => [n.value],
  } as NodeDef<n.MultilineLiteral>,

  DurationLiteral: {
    build(node, obj) {
      node.value = obj.value
    },
    next: (n) => null,
    print: (n) => [n.value],
  } as NodeDef<n.DurationLiteral>,

  NumericLiteral: {
    build(node, obj) {
      node.value = obj.value
    },
    next: (n) => null,
    print: (n) => [n.value],
  } as NodeDef<n.NumericLiteral>,

  Identifier: {
    build(node, obj) {
      node.name = obj.name
    },
    next: (n) => null,
    print: (n) => [n.name],
  } as NodeDef<n.Identifier>,

  Header: {
    build(node, obj) {
      node.name = obj.name
    },
    next: (n) => null,
    print: (n) => [n.name],
  } as NodeDef<n.Header>,

  Ip: {
    build(node, obj) {
      node.value = obj.value
      node.cidr = obj.cidr
    },
    next: (n) => null,
    print: (n) => [n.value],
  } as NodeDef<n.Ip>,

  Member: {
    build(node, obj) {
      node.base = obj.base
      node.member = obj.member
    },
    next: (n) => [n.base, n.member],
    print: (n) => [n.base, '.', n.member],
  } as NodeDef<n.Member>,

  BooleanExpression: {
    build(node, obj) {
      node.body = obj.body
    },
    next: (n) => [n.body],
    print: (n) => ['(', n.body, ')'],
  } as NodeDef<n.BooleanExpression>,

  UnaryExpression: {
    build(node, obj) {
      node.operator = obj.operator
      node.argument = obj.argument
    },
    next: (n) => [n.argument],
    print: (n) => {
      return [n.operator, n.argument]
    },
  } as NodeDef<n.UnaryExpression>,

  FunCallExpression: {
    build(node, obj) {
      node.callee = obj.callee
      node.arguments = obj.arguments
    },
    next: (n) => null,
    print: (n) => [n.callee, '(', n.arguments, ')'],
  } as NodeDef<n.FunCallExpression>,

  ConcatExpression: {
    build(node, obj) {
      node.body = obj.body
    },
    next: (n) => n.body,
    print: (n) => n.body,
  } as NodeDef<n.ConcatExpression>,

  BinaryExpression: {
    build(node, obj) {
      node.left = obj.left
      node.right = obj.right
      node.operator = obj.operator
    },
    next: (n) => [n.left, n.right],
    print: (n) => [n.left, n.operator, n.right],
  } as NodeDef<n.BinaryExpression>,

  LogicalExpression: {
    build(node, obj) {
      node.left = obj.left
      node.right = obj.right
      node.operator = obj.operator
    },
    next: (n) => [n.left, n.right],
    print: (n) => [n.left, n.operator, n.right],
  } as NodeDef<n.LogicalExpression>,

  ExpressionStatement: {
    build(node, obj) {
      node.body = obj.body
    },
    next: (n) => [n.body],
    print: (n) => [n.body, ';'],
  } as NodeDef<n.ExpressionStatement>,

  IncludeStatement: {
    build(node, obj) {
      node.module = obj.module
    },
    next: (n) => [n.module],
    print: (n) => ['include', n.module, ';'],
  } as NodeDef<n.IncludeStatement>,

  ImportStatement: {
    build(node, obj) {
      node.module = obj.module
    },
    next: (n) => [n.module],
    print: (n) => ['import', n.module, ';'],
  } as NodeDef<n.ImportStatement>,

  CallStatement: {
    build(node, obj) {
      node.subroutine = obj.subroutine
    },
    next: (n) => [n.subroutine],
    print: (n) => ['call', n.subroutine, ';'],
  } as NodeDef<n.CallStatement>,

  DeclareStatement: {
    build(node, obj) {
      node.id = obj.id
      node.valueType = obj.valueType
    },
    next: (n) => [n.id],
    print: (n) => ['declare', 'local', n.id, n.valueType, ';'],
  } as NodeDef<n.DeclareStatement>,

  AddStatement: {
    build(node, obj) {
      node.left = obj.left
      node.right = obj.right
      node.operator = obj.operator
    },
    next: (n) => [n.left, n.right],
    print: (n) => ['add', n.left, n.operator, n.right, ';'],
  } as NodeDef<n.AddStatement>,

  SetStatement: {
    build(node, obj) {
      node.left = obj.left
      node.right = obj.right
      node.operator = obj.operator
    },
    next: (n) => [n.left, n.right],
    print: (n) => ['set', n.left, n.operator, n.right, ';'],
  } as NodeDef<n.SetStatement>,

  UnsetStatement: {
    build(node, obj) {
      node.id = obj.id
    },
    next: (n) => [n.id],
    print: (n) => ['unset', n.id],
  } as NodeDef<n.UnsetStatement>,

  ReturnStatement: {
    build(node, obj) {
      node.action = obj.action
    },
    next: (n) => null,
    print: (n) => ['return', n.action, ';'],
  } as NodeDef<n.ReturnStatement>,

  ErrorStatement: {
    build(node, obj) {
      node.status = obj.status
      node.message = obj.message
    },
    next: (n) => [n.message],
    print: (n) => ['error', n.status, n.message, ';'],
  } as NodeDef<n.ErrorStatement>,

  RestartStatement: {
    build(node, obj) {},
    next: (n) => null,
    print: (n) => ['restart', ';'],
  } as NodeDef<n.RestartStatement>,

  SyntheticStatement: {
    build(node, obj) {
      node.response = obj.response
    },
    next: (n) => [n.response],
    print: (n) => ['synthetic', n.response, ';'],
  } as NodeDef<n.SyntheticStatement>,

  LogStatement: {
    build(node, obj) {
      node.content = obj.content
    },
    next: (n) => [n.content],
    print: (n) => ['log', n.content, ';'],
  } as NodeDef<n.LogStatement>,

  IfStatement: {
    build(node, obj) {
      node.test = obj.test
      node.consequent = obj.consequent
      node.alternative = obj.alternative
    },
    next: (n) =>
      [n.test, ...n.consequent, n.alternative].filter(Boolean).flat(2),
    print: (n) => [
      'if',
      '(',
      n.test,
      ')',
      '{',
      n.consequent,
      '}',
      ...(Array.isArray(n.alternative)
        ? ['else', ...n.alternative]
        : ['else', '{', n.alternative, '}']),
    ],
  } as NodeDef<n.IfStatement>,

  SubroutineStatement: {
    build(node, obj) {
      node.id = obj.id
      node.body = obj.body
    },
    next: (n) => [n.id, ...n.body],
    print: (n) => ['sub', n.id, '{', ...n.body, '}'],
  } as NodeDef<n.SubroutineStatement>,

  AclStatement: {
    build(node, obj) {
      node.id = obj.id
      node.body = obj.body
    },
    next: (n) => [n.id, ...n.body],
    print: (n) => ['acl', n.id, '{', ...n.body, '}'],
  } as NodeDef<n.AclStatement>,

  BackendStatement: {
    build(node, obj) {
      node.id = obj.id
      node.body = obj.body
    },
    next: (n) => [n.id, ...n.body.map((b) => b.value).flat(2)],
    print: (n) => [
      'backend',
      n.id,
      '{',
      ...n.body.map((b) => [b.key, b.value]).flat(2),
      '}',
    ],
  } as NodeDef<n.BackendStatement>,

  TableStatement: {
    build(node, obj) {
      node.id = obj.id
      node.body = obj.body
    },
    next: (n) => [n.id, ...n.body],
    print: (n) => ['table', n.id, '{', ...n.body, '}'],
  } as NodeDef<n.TableStatement>,
} as const
