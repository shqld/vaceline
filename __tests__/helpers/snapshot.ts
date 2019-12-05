import fs from 'fs'
import {
  join as joinPath,
  resolve as resolvePath,
  parse as parsePath,
} from 'path'
import assert from 'assert'
import {
  map as nodeMap,
  BaseNode,
  BaseExpression,
  BaseStatement,
  Node,
  Expression,
  Statement,
  BaseLiteral,
} from '../../src/nodes'
// @ts-ignore
import { parse as parseMarkdown } from '@textlint/markdown-to-ast'
import { parseExpr } from '../../src/parser/expression'
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
  parse: (source: string) => Node | Expression | Statement
  basic: Array<TestCase>
  abnormal: Array<TestCase>
  lint: Array<TestCase>
  format: Array<TestCase>
}

const getValueFromHeader = (headerNode: { children: Array<{ raw: string }> }) =>
  headerNode.children.map((child) => child.raw).join('')

const getParser = (Node: Class<BaseNode>) => {
  const proto = Object.getPrototypeOf(Node)

  return proto === BaseExpression || proto === BaseLiteral
    ? (source: string) => parseExpr(new Parser(source))
    : proto === BaseStatement
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
          case 2:
            buf = null

            const value = getValueFromHeader(node) as keyof TestDoc

            assert(
              Array.isArray(doc[value]),
              `No such a caseName: (${path}) ${value}`
            )

            cases = doc[value] as Array<TestCase>
            break
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
          name: buf!,
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

  const Node = nodeMap[doc.name as keyof typeof nodeMap]

  assert(Node != null, doc.name)

  const parser = getParser(Node)

  doc.parse = parser

  return doc
}

export const testdocs = fs
  .readdirSync(specsPath)
  .filter((p) => p.endsWith('.md'))
  .map(parseTestDoc)
