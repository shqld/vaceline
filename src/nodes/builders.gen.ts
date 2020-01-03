import * as d from './defs'
import { Location, BaseNode, NodeWithLoc, buildEmptryLocation } from './node'

export function buildProgram(
  body: Array<d.Statement>,
  loc?: Location
): NodeWithLoc<d.Program> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<d.Program>

  node.type = 'Program'
  node.loc = loc || buildEmptryLocation()

  node.body = body

  return node
}

export function buildBooleanLiteral(
  value: string,
  loc?: Location
): NodeWithLoc<d.BooleanLiteral> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.BooleanLiteral
  >

  node.type = 'BooleanLiteral'
  node.loc = loc || buildEmptryLocation()

  node.value = value

  return node
}

export function buildStringLiteral(
  value: string,
  loc?: Location
): NodeWithLoc<d.StringLiteral> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<d.StringLiteral>

  node.type = 'StringLiteral'
  node.loc = loc || buildEmptryLocation()

  node.value = value

  return node
}

export function buildMultilineLiteral(
  value: string,
  loc?: Location
): NodeWithLoc<d.MultilineLiteral> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.MultilineLiteral
  >

  node.type = 'MultilineLiteral'
  node.loc = loc || buildEmptryLocation()

  node.value = value

  return node
}

export function buildDurationLiteral(
  value: string,
  loc?: Location
): NodeWithLoc<d.DurationLiteral> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.DurationLiteral
  >

  node.type = 'DurationLiteral'
  node.loc = loc || buildEmptryLocation()

  node.value = value

  return node
}

export function buildNumericLiteral(
  value: string,
  loc?: Location
): NodeWithLoc<d.NumericLiteral> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.NumericLiteral
  >

  node.type = 'NumericLiteral'
  node.loc = loc || buildEmptryLocation()

  node.value = value

  return node
}

export function buildIdentifier(
  name: string,
  loc?: Location
): NodeWithLoc<d.Identifier> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<d.Identifier>

  node.type = 'Identifier'
  node.loc = loc || buildEmptryLocation()

  node.name = name

  return node
}

export function buildIp(
  value: string,
  cidr?: number,
  loc?: Location
): NodeWithLoc<d.Ip> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<d.Ip>

  node.type = 'Ip'
  node.loc = loc || buildEmptryLocation()

  node.value = value
  node.cidr = cidr

  return node
}

export function buildMember(
  base: d.Identifier | d.Member,
  member: d.Identifier,
  loc?: Location
): NodeWithLoc<d.Member> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<d.Member>

  node.type = 'Member'
  node.loc = loc || buildEmptryLocation()

  node.base = base
  node.member = member

  return node
}

export function buildValuePair(
  base: d.Identifier | d.Member,
  name: d.Identifier,
  loc?: Location
): NodeWithLoc<d.ValuePair> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<d.ValuePair>

  node.type = 'ValuePair'
  node.loc = loc || buildEmptryLocation()

  node.base = base
  node.name = name

  return node
}

export function buildBooleanExpression(
  body: d.Expression,
  loc?: Location
): NodeWithLoc<d.BooleanExpression> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.BooleanExpression
  >

  node.type = 'BooleanExpression'
  node.loc = loc || buildEmptryLocation()

  node.body = body

  return node
}

export function buildUnaryExpression(
  operator: string,
  argument: d.Expression,
  loc?: Location
): NodeWithLoc<d.UnaryExpression> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.UnaryExpression
  >

  node.type = 'UnaryExpression'
  node.loc = loc || buildEmptryLocation()

  node.operator = operator
  node.argument = argument

  return node
}

export function buildFunCallExpression(
  callee: d.Member | d.Identifier | d.ValuePair,
  args: Array<d.Expression>,
  loc?: Location
): NodeWithLoc<d.FunCallExpression> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.FunCallExpression
  >

  node.type = 'FunCallExpression'
  node.loc = loc || buildEmptryLocation()

  node.callee = callee
  node.args = args

  return node
}

export function buildConcatExpression(
  body: Array<d.Expression>,
  loc?: Location
): NodeWithLoc<d.ConcatExpression> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.ConcatExpression
  >

  node.type = 'ConcatExpression'
  node.loc = loc || buildEmptryLocation()

  node.body = body

  return node
}

export function buildBinaryExpression(
  left: d.Expression,
  right: d.Expression,
  operator: string,
  loc?: Location
): NodeWithLoc<d.BinaryExpression> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.BinaryExpression
  >

  node.type = 'BinaryExpression'
  node.loc = loc || buildEmptryLocation()

  node.left = left
  node.right = right
  node.operator = operator

  return node
}

export function buildLogicalExpression(
  left: d.Expression,
  right: d.Expression,
  operator: string,
  loc?: Location
): NodeWithLoc<d.LogicalExpression> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.LogicalExpression
  >

  node.type = 'LogicalExpression'
  node.loc = loc || buildEmptryLocation()

  node.left = left
  node.right = right
  node.operator = operator

  return node
}

export function buildExpressionStatement(
  body: d.Expression,
  loc?: Location
): NodeWithLoc<d.ExpressionStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.ExpressionStatement
  >

  node.type = 'ExpressionStatement'
  node.loc = loc || buildEmptryLocation()

  node.body = body

  return node
}

export function buildIncludeStatement(
  module: d.StringLiteral,
  loc?: Location
): NodeWithLoc<d.IncludeStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.IncludeStatement
  >

  node.type = 'IncludeStatement'
  node.loc = loc || buildEmptryLocation()

  node.module = module

  return node
}

export function buildImportStatement(
  module: d.Identifier,
  loc?: Location
): NodeWithLoc<d.ImportStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.ImportStatement
  >

  node.type = 'ImportStatement'
  node.loc = loc || buildEmptryLocation()

  node.module = module

  return node
}

export function buildCallStatement(
  subroutine: d.Identifier,
  loc?: Location
): NodeWithLoc<d.CallStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<d.CallStatement>

  node.type = 'CallStatement'
  node.loc = loc || buildEmptryLocation()

  node.subroutine = subroutine

  return node
}

export function buildDeclareStatement(
  id: d.Identifier | d.Member,
  valueType: d.DeclareValueType,
  loc?: Location
): NodeWithLoc<d.DeclareStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.DeclareStatement
  >

  node.type = 'DeclareStatement'
  node.loc = loc || buildEmptryLocation()

  node.id = id
  node.valueType = valueType

  return node
}

export function buildAddStatement(
  left: d.Identifier | d.Member,
  right: d.Expression,
  operator: string,
  loc?: Location
): NodeWithLoc<d.AddStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<d.AddStatement>

  node.type = 'AddStatement'
  node.loc = loc || buildEmptryLocation()

  node.left = left
  node.right = right
  node.operator = operator

  return node
}

export function buildSetStatement(
  left: d.Identifier | d.Member,
  right: d.Expression,
  operator: string,
  loc?: Location
): NodeWithLoc<d.SetStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<d.SetStatement>

  node.type = 'SetStatement'
  node.loc = loc || buildEmptryLocation()

  node.left = left
  node.right = right
  node.operator = operator

  return node
}

export function buildUnsetStatement(
  id: d.Identifier | d.Member,
  loc?: Location
): NodeWithLoc<d.UnsetStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.UnsetStatement
  >

  node.type = 'UnsetStatement'
  node.loc = loc || buildEmptryLocation()

  node.id = id

  return node
}

export function buildReturnStatement(
  action: d.ReturnActionName,
  loc?: Location
): NodeWithLoc<d.ReturnStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.ReturnStatement
  >

  node.type = 'ReturnStatement'
  node.loc = loc || buildEmptryLocation()

  node.action = action

  return node
}

export function buildErrorStatement(
  status: number,
  message?: d.Expression,
  loc?: Location
): NodeWithLoc<d.ErrorStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.ErrorStatement
  >

  node.type = 'ErrorStatement'
  node.loc = loc || buildEmptryLocation()

  node.status = status
  node.message = message

  return node
}

export function buildRestartStatement(
  loc?: Location
): NodeWithLoc<d.RestartStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.RestartStatement
  >

  node.type = 'RestartStatement'
  node.loc = loc || buildEmptryLocation()

  return node
}

export function buildSyntheticStatement(
  response: d.Expression,
  loc?: Location
): NodeWithLoc<d.SyntheticStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.SyntheticStatement
  >

  node.type = 'SyntheticStatement'
  node.loc = loc || buildEmptryLocation()

  node.response = response

  return node
}

export function buildLogStatement(
  content: d.Expression,
  loc?: Location
): NodeWithLoc<d.LogStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<d.LogStatement>

  node.type = 'LogStatement'
  node.loc = loc || buildEmptryLocation()

  node.content = content

  return node
}

export function buildIfStatement(
  test: d.Expression,
  consequent: Array<d.Statement>,
  alternative?: d.IfStatement | Array<d.Statement>,
  loc?: Location
): NodeWithLoc<d.IfStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<d.IfStatement>

  node.type = 'IfStatement'
  node.loc = loc || buildEmptryLocation()

  node.test = test
  node.consequent = consequent
  node.alternative = alternative

  return node
}

export function buildSubroutineStatement(
  id: d.Identifier,
  body: Array<d.Statement>,
  loc?: Location
): NodeWithLoc<d.SubroutineStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.SubroutineStatement
  >

  node.type = 'SubroutineStatement'
  node.loc = loc || buildEmptryLocation()

  node.id = id
  node.body = body

  return node
}

export function buildAclStatement(
  id: d.Identifier,
  body: Array<d.Ip>,
  loc?: Location
): NodeWithLoc<d.AclStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<d.AclStatement>

  node.type = 'AclStatement'
  node.loc = loc || buildEmptryLocation()

  node.id = id
  node.body = body

  return node
}

export function buildBackendDefinition(
  key: string,
  value: d.Expression | Array<d.BackendDefinition>,
  loc?: Location
): NodeWithLoc<d.BackendDefinition> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.BackendDefinition
  >

  node.type = 'BackendDefinition'
  node.loc = loc || buildEmptryLocation()

  node.key = key
  node.value = value

  return node
}

export function buildBackendStatement(
  id: d.Identifier,
  body: Array<d.BackendDefinition>,
  loc?: Location
): NodeWithLoc<d.BackendStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.BackendStatement
  >

  node.type = 'BackendStatement'
  node.loc = loc || buildEmptryLocation()

  node.id = id
  node.body = body

  return node
}

export function buildTableDefinition(
  key: string,
  value: string,
  loc?: Location
): NodeWithLoc<d.TableDefinition> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.TableDefinition
  >

  node.type = 'TableDefinition'
  node.loc = loc || buildEmptryLocation()

  node.key = key
  node.value = value

  return node
}

export function buildTableStatement(
  id: d.Identifier,
  body: Array<d.TableDefinition>,
  loc?: Location
): NodeWithLoc<d.TableStatement> {
  const node = Object.create(BaseNode.prototype) as NodeWithLoc<
    d.TableStatement
  >

  node.type = 'TableStatement'
  node.loc = loc || buildEmptryLocation()

  node.id = id
  node.body = body

  return node
}
