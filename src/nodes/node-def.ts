import { Node } from './node'
import * as n from '../ast-nodes.d'

type ExtractNodeFromDef<Def> = Def extends NodeDef<infer Node> ? Node : never

export type NodeDefMap = typeof nodeDefs
export type NodeType = keyof NodeDefMap
export type NodeAs<T extends NodeType> = ExtractNodeFromDef<NodeDefMap[T]>

export interface NodeDef<T extends Node> {
  build(node: T, obj: Omit<T, keyof Node>): void
  // print(): Printable | Array<Printable>
  next(node: T): null | ReadonlyArray<Node | Array<Node>>
  // next: Array<keyof Omit<T, keyof Node>>
}

export const nodeDefs = {
  File: {
    build: (n, o) => {
      n.filePath = o.filePath
      n.program = o.program
      n.comments = o.comments
    },
    next: (n) => [n.program],
    // next: ['program'],
  } as NodeDef<n.File>,

  Program: {
    build(node, obj) {
      node.body = obj.body
    },
    next(node) {
      return [node.body]
    },
    // next: ['body'],
  } as NodeDef<n.Program>,

  Comment: {
    build(node, obj) {
      node.body = obj.body
    },
  } as NodeDef<n.Comment>,

  Block: {
    build(node, obj) {
      node.body = obj.body
    },
  } as NodeDef<n.Block>,

  BooleanLiteral: {
    build(node, obj) {
      node.value = obj.value
    },
  } as NodeDef<n.BooleanLiteral>,

  StringLiteral: {
    build(node, obj) {
      node.value = obj.value
    },
  } as NodeDef<n.StringLiteral>,

  MultilineLiteral: {
    build(node, obj) {
      node.value = obj.value
    },
  } as NodeDef<n.MultilineLiteral>,

  DurationLiteral: {
    build(node, obj) {
      node.value = obj.value
    },
  } as NodeDef<n.DurationLiteral>,

  NumericLiteral: {
    build(node, obj) {
      node.value = obj.value
    },
  } as NodeDef<n.NumericLiteral>,

  IpLiteral: {
    build(node, obj) {
      node.value = obj.value
    },
  } as NodeDef<n.IpLiteral>,

  Identifier: {
    build(node, obj) {
      node.name = obj.name
    },
  } as NodeDef<n.Identifier>,

  Header: {
    build(node, obj) {
      node.name = obj.name
    },
  } as NodeDef<n.Header>,

  MemberExpression: {
    build(node, obj) {
      node.object = obj.object
      node.property = obj.property
    },
  } as NodeDef<n.MemberExpression>,

  BooleanExpression: {
    build(node, obj) {
      node.body = obj.body
    },
  } as NodeDef<n.BooleanExpression>,

  UnaryExpression: {
    build(node, obj) {
      node.operator = obj.operator
      node.argument = obj.argument
    },
  } as NodeDef<n.UnaryExpression>,

  FunCallExpression: {
    build(node, obj) {
      node.callee = obj.callee
      node.arguments = obj.arguments
    },
  } as NodeDef<n.FunCallExpression>,

  ConcatExpression: {
    build(node, obj) {
      node.body = obj.body
    },
  } as NodeDef<n.ConcatExpression>,

  BinaryExpression: {
    build(node, obj) {
      node.left = obj.left
      node.right = obj.right
      node.operator = obj.operator
    },
  } as NodeDef<n.BinaryExpression>,

  LogicalExpression: {
    build(node, obj) {
      node.left = obj.left
      node.right = obj.right
      node.operator = obj.operator
    },
  } as NodeDef<n.LogicalExpression>,

  ExpressionStatement: {
    build(node, obj) {
      node.body = obj.body
    },
  } as NodeDef<n.ExpressionStatement>,

  IncludeStatement: {
    build(node, obj) {
      node.module = obj.module
    },
  } as NodeDef<n.IncludeStatement>,

  ImportStatement: {
    build(node, obj) {
      node.module = obj.module
    },
  } as NodeDef<n.ImportStatement>,

  CallStatement: {
    build(node, obj) {
      node.subroutine = obj.subroutine
    },
  } as NodeDef<n.CallStatement>,

  DeclareStatement: {
    build(node, obj) {
      node.id = obj.id
      node.valueType = obj.valueType
    },
  } as NodeDef<n.DeclareStatement>,

  AddStatement: {
    build(node, obj) {
      node.left = obj.left
      node.right = obj.right
      node.operator = obj.operator
    },
  } as NodeDef<n.AddStatement>,

  SetStatement: {
    build(node, obj) {
      node.left = obj.left
      node.right = obj.right
      node.operator = obj.operator
    },
  } as NodeDef<n.SetStatement>,

  UnsetStatement: {
    build(node, obj) {
      node.id = obj.id
    },
  } as NodeDef<n.UnsetStatement>,

  ReturnStatement: {
    build(node, obj) {
      node.action = obj.action
    },
  } as NodeDef<n.ReturnStatement>,

  ErrorStatement: {
    build(node, obj) {
      node.status = obj.status
      node.message = obj.message
    },
  } as NodeDef<n.ErrorStatement>,

  RestartStatement: {
    build(node, obj) {},
  } as NodeDef<n.RestartStatement>,

  SyntheticStatement: {
    build(node, obj) {
      node.response = obj.response
    },
  } as NodeDef<n.SyntheticStatement>,

  LogStatement: {
    build(node, obj) {
      node.content = obj.content
    },
  } as NodeDef<n.LogStatement>,

  IfStatement: {
    build(node, obj) {
      node.test = obj.test
      node.consequent = obj.consequent
      node.alternative = obj.alternative
    },
  } as NodeDef<n.IfStatement>,

  SubroutineStatement: {
    build(node, obj) {
      node.id = obj.id
      node.body = obj.body
    },
  } as NodeDef<n.SubroutineStatement>,

  AclStatement: {
    build(node, obj) {
      node.id = obj.id
      node.body = obj.body
    },
  } as NodeDef<n.AclStatement>,

  StructDefinitionExpression: {
    build(node, obj) {
      node.body = obj.body
    },
  } as NodeDef<n.StructDefinitionExpression>,

  MemberAssignStatement: {
    build(node, obj) {
      node.id = obj.id
      node.value = obj.value
    },
  } as NodeDef<n.MemberAssignStatement>,

  BackendStatement: {
    build(node, obj) {
      node.id = obj.id
      node.body = obj.body
    },
  } as NodeDef<n.BackendStatement>,
} as const
