import fs from 'fs'
import {
  join as joinPath,
  resolve as resolvePath,
  parse as parsePath,
} from 'path'
import assert from 'assert'
import { d, BaseNode, NodeType } from '../../src/nodes'
import { parse as parseMarkdown } from '@textlint/markdown-to-ast'
import { parseExpr } from '../../src/parser/expression/index'
import { parseStmt } from '../../src/parser/statement'
import { parse as parseNode } from '../../src'
import { Parser } from '../../src/parser'

const specsPath = resolvePath('specs')

interface TestCase {
  name: string
  code: string
}
interface TestDoc {
  name: string
  parse: (source: string) => d.Node | d.Expression | d.Statement
  basic: Array<TestCase>
  abnormal: Array<TestCase>
  lint: Array<TestCase>
  format: Array<TestCase>
}

const getValueFromHeader = (headerNode: { children: Array<{ raw: string }> }) =>
  headerNode.children.map((child) => child.raw).join('')

const EXPRESSION_TYPES: Array<NodeType> = [
  'BooleanLiteral',
  'StringLiteral',
  'MultilineLiteral',
  'DurationLiteral',
  'NumericLiteral',
  'Identifier',
  'Ip',
  'Member',
  'ValuePair',
  'BooleanExpression',
  'UnaryExpression',
  'FunCallExpression',
  'ConcatExpression',
  'BinaryExpression',
  'LogicalExpression',
  'BackendDefinition',
  'TableDefinition',
]

const STATEMENT_TYPES: Array<NodeType> = [
  'AclStatement',
  'AddStatement',
  'BackendStatement',
  'CallStatement',
  'DeclareStatement',
  'ErrorStatement',
  'ExpressionStatement',
  'IfStatement',
  'ImportStatement',
  'IncludeStatement',
  'LogStatement',
  'RestartStatement',
  'ReturnStatement',
  'SetStatement',
  'SubroutineStatement',
  'SyntheticStatement',
  'TableStatement',
  'UnsetStatement',
]

const getParser = (type: NodeType) => {
  return EXPRESSION_TYPES.includes(type)
    ? (source: string) => parseExpr(new Parser(source))
    : STATEMENT_TYPES.includes(type)
    ? (source: string) => parseStmt(new Parser(source))
    : parseNode.bind(null)
}

const pascalCase = (str: string) =>
  str
    .split('-')
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join('')

export const parseTestDoc = (path: string): TestDoc => {
  const file = fs.readFileSync(joinPath(specsPath, path), 'utf8')

  const name = pascalCase(parsePath(path).name)

  const { type, children } = parseMarkdown(file)

  assert(type === 'Document')
  assert(Array.isArray(children))

  const doc: TestDoc = {
    name,
    parse: parseNode,
    basic: [],
    abnormal: [],
    lint: [],
    format: [],
  }

  let i = 0
  let cases = doc.basic
  let buf: string | null = null

  while (i < children.length) {
    const node = children[i++]

    switch (node.type) {
      case 'Header':
        switch (node.depth) {
          case 1:
            break
          case 2: {
            buf = null

            const value = getValueFromHeader(node) as keyof TestDoc

            assert(
              Array.isArray(doc[value]),
              `No such a caseName: (${path}) ${value}`
            )

            cases = doc[value] as Array<TestCase>
            break
          }
          default:
            assert(
              false,
              `Heading depth must be 1 to 2, got: (${path}) ${node.depth}`
            )
        }

        break
      case 'CodeBlock':
        assert(
          node.lang === 'vcl',
          `Code Language must be 'vcl', got: (${path}) ${node.lang}`
        )

        assert(typeof buf === 'string', `Buf broken at (${path})`)

        cases.push({
          name: buf as string,
          code: node.value,
        })

        buf = null
        break
      case 'Paragraph':
        assert(
          Array.isArray(node.children) && node.children.length,
          `Paragraph children must be present: (${path}) ${node.children[0].type}`
        )

        buf = node.children.map((c: { raw: string }) => c.raw).join('')

        break
      case 'Html':
        // For comments
        break
      default:
        assert(
          false,
          `Currently only Header and CodeBlock are supported, got: (${path}) ${node.type} ${node.raw}`
        )
        break
    }
  }

  const parser = getParser(doc.name as NodeType)

  doc.parse = parser

  return doc
}

export const testdocs = fs
  .readdirSync(specsPath)
  .filter((p) => p.endsWith('.md'))
  .map(parseTestDoc)
