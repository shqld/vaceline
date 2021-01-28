import { BaseNode } from '.'

export type Literal =
  | BooleanLiteral
  | DurationLiteral
  | MultilineLiteral
  | NumericLiteral
  | StringLiteral
  | Ip

export interface BooleanLiteral extends BaseNode {
  type: 'BooleanLiteral'
  value: string
}

export interface StringLiteral extends BaseNode {
  type: 'StringLiteral'
  value: string
}

export interface MultilineLiteral extends BaseNode {
  type: 'MultilineLiteral'
  value: string
}

export interface DurationLiteral extends BaseNode {
  type: 'DurationLiteral'
  value: string
}

export interface NumericLiteral extends BaseNode {
  type: 'NumericLiteral'
  value: string
}

export interface Ip extends BaseNode {
  type: 'Ip'
  value: string
  cidr?: number
}
