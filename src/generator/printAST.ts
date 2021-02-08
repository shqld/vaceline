import { Doc, builders as b } from 'prettier/doc'
import { Node, isLocated, Located } from '../nodes'
import * as d from '../nodes'

export function printNode(node: Node, options?: object): Doc {
  switch (node.type) {
    case 'Program':
      return printProgram(node, options)

    case 'AclStatement':
      return printAclStatement(node, options)
    case 'AddStatement':
      return printAddStatement(node, options)
    case 'BackendStatement':
      return printBackendStatement(node, options)
    case 'CallStatement':
      return printCallStatement(node, options)
    case 'DeclareStatement':
      return printDeclareStatement(node, options)
    case 'ErrorStatement':
      return printErrorStatement(node, options)
    case 'ExpressionStatement':
      return printExpressionStatement(node, options)
    case 'IfStatement':
      return printIfStatement(node, options)
    case 'ImportStatement':
      return printImportStatement(node, options)
    case 'IncludeStatement':
      return printIncludeStatement(node, options)
    case 'LogStatement':
      return printLogStatement(node, options)
    case 'RestartStatement':
      return printRestartStatement(node, options)
    case 'ReturnStatement':
      return printReturnStatement(node, options)
    case 'SetStatement':
      return printSetStatement(node, options)
    case 'SubroutineStatement':
      return printSubroutineStatement(node, options)
    case 'SyntheticStatement':
      return printSyntheticStatement(node, options)
    case 'TableStatement':
      return printTableStatement(node, options)
    case 'UnsetStatement':
      return printUnsetStatement(node, options)

    case 'BooleanLiteral':
      return printBooleanLiteral(node, options)
    case 'DurationLiteral':
      return printDurationLiteral(node, options)
    case 'MultilineLiteral':
      return printMultilineLiteral(node, options)
    case 'NumericLiteral':
      return printNumericLiteral(node, options)
    case 'StringLiteral':
      return printStringLiteral(node, options)

    case 'BinaryExpression':
      return printBinaryExpression(node, options)
    case 'BooleanExpression':
      return printBooleanExpression(node, options)
    case 'ConcatExpression':
      return printConcatExpression(node, options)
    case 'FunCallExpression':
      return printFunCallExpression(node, options)
    case 'Identifier':
      return printIdentifier(node, options)
    case 'Ip':
      return printIp(node, options)
    case 'LogicalExpression':
      return printLogicalExpression(node, options)
    case 'Member':
      return printMember(node, options)
    case 'UnaryExpression':
      return printUnaryExpression(node, options)
    case 'ValuePair':
      return printValuePair(node, options)
    case 'BackendDefinition':
      return printBackendDefinition(node, options)
    case 'TableDefinition':
      return printTableDefinition(node, options)
    case 'DirectorStatement':
      return printDirectorStatement(node, options)
  }
}

type PrinterFunc<T extends Node, U extends object = object> = (
  node: T,
  options?: U
) => Doc

export function printStatements(stmts: Array<d.Statement>): Doc {
  const doc = []

  let lastLine: number =
    (stmts[0] && isLocated(stmts[0]) && getLastLine(stmts[0])) || 1

  for (const stmt of stmts) {
    if (isLocated(stmt) && stmt.loc.start.line - lastLine > 0) {
      // Compare the next line with previous line of the last node
      // TODO: Set max number of empty lines between statements
      let delta = getFirstLine(stmt) - lastLine - 1

      while (delta--) {
        doc.push(b.hardline)
      }

      // Set last line of the current node as the last line to compare
      // with in the next iteration
      lastLine = getLastLine(stmt)
    }

    doc.push(printNode(stmt), b.hardline)
  }

  doc.pop()

  return b.concat(doc)
}

function getFirstLine(node: Located<Node>): number {
  // first leading comment or first line of node
  return node.leadingComments?.[0]?.loc?.start.line ?? node.loc.start.line
}

function getLastLine(node: Located<Node>): number {
  // last trailing comment or last line of node
  return (
    node.trailingComments?.[node.trailingComments?.length - 1]?.loc?.end.line ??
    node.loc.end.line
  )
}

export const base = <T extends Node, U extends object>(
  printer: PrinterFunc<T, U>
): PrinterFunc<T, U> => {
  return (node: T, options?: U) => {
    let printed = printer(node, options)

    if (node.leadingComments?.length)
      printed = b.concat([
        b.join(
          b.hardline,
          node.leadingComments.map((comment) => comment.value)
        ),
        b.hardline,
        printed,
      ])

    if (node.trailingComments?.length)
      printed = b.concat([
        printed,
        ' ',
        ...node.trailingComments.map((comment) => comment.value),
      ])

    // TODO: print innerComments

    return printed
  }
}

export const printProgram = base((node: d.Program) => {
  return printStatements(node.body)
})

export const printBooleanLiteral = base((node: d.BooleanLiteral) => {
  return node.value
})

export const printStringLiteral = base((node: d.StringLiteral) => {
  return node.value
})

export const printMultilineLiteral = base((node: d.MultilineLiteral) => {
  return node.value
})

export const printDurationLiteral = base((node: d.DurationLiteral) => {
  return node.value
})

export const printNumericLiteral = base((node: d.NumericLiteral) => {
  return node.value
})

export const printIdentifier = base((node: d.Identifier) => {
  return node.name
})

export const printIp = base((node: d.Ip) => {
  return node.cidr ? `"${node.value}"/${node.cidr}` : `"${node.value}"`
})

export const printMember: PrinterFunc<
  d.Member,
  { neverBreak?: boolean; broken?: boolean }
> = base((node, options) => {
  const { neverBreak = false, broken = false } = options ?? {}

  const shouldBreak =
    !neverBreak &&
    // break if child is also a Member or if also parent is already broken
    (node.base.type === 'Member' || broken)

  // printExpr('Member',  {})
  return b.concat([
    b.group(
      b.concat([
        printNode(node.base, {
          neverBreak,
          broken: shouldBreak,
        }),
        b.indent(
          b.concat([
            shouldBreak ? b.softline : '',
            '.',
            printIdentifier(node.member),
          ])
        ),
      ])
    ),
  ])
})

export const printValuePair = base((node: d.ValuePair) => {
  return b.concat([printNode(node.base), ':', printIdentifier(node.name)])
})

export const printBooleanExpression = base((node: d.BooleanExpression) => {
  return b.group(
    b.concat([
      b.indent(
        b.concat(['(', b.ifBreak(b.softline, ''), printNode(node.body)])
      ),
      b.ifBreak(b.softline, ''),
      ')',
    ])
  )
})

export const printUnaryExpression = base((node: d.UnaryExpression) => {
  return b.concat([node.operator, printNode(node.argument)])
})

export const printFunCallExpression = base((node: d.FunCallExpression) => {
  return b.concat([
    printNode(node.callee),
    '(',
    b.group(
      b.concat([
        b.indent(
          b.concat([
            b.ifBreak(b.line, ''),
            b.join(
              b.concat([',', b.line]),
              node.args.map((n) => printNode(n))
            ),
            b.ifBreak(',', ''),
          ])
        ),
        b.ifBreak(b.line, ''),
      ])
    ),
    ')',
  ])
})

export const printConcatExpression = base((node: d.ConcatExpression) => {
  return b.group(
    b.indent(
      b.join(
        b.line,
        node.body.map((n) => printNode(n))
      )
    )
  )
})

export const printBinaryExpression: PrinterFunc<d.BinaryExpression> = base(
  (node: d.BinaryExpression) => {
    const left =
      node.left.type === 'BinaryExpression'
        ? b.concat(['(', printBinaryExpression(node.left), ')'])
        : printNode(node.left)

    return b.group(
      b.concat([
        left,
        ' ',
        b.indent(b.concat([node.operator, b.line, printNode(node.right)])),
      ])
    )
  }
)

export const printLogicalExpression: PrinterFunc<d.LogicalExpression> = base(
  (node: d.LogicalExpression) => {
    const left =
      node.left.type === 'LogicalExpression' &&
      node.operator === '||' &&
      node.left.operator === '&&'
        ? b.concat(['(', printLogicalExpression(node.left), ')'])
        : printNode(node.left)

    const right =
      node.right.type === 'LogicalExpression' &&
      node.operator === '||' &&
      node.right.operator === '&&'
        ? b.concat(['(', printLogicalExpression(node.right), ')'])
        : printNode(node.right)

    return b.group(
      b.concat([left, ' ', b.indent(b.concat([node.operator, b.line, right]))])
    )
  }
)

export const printExpressionStatement = base((node: d.ExpressionStatement) => {
  return b.concat([printNode(node.body), ';'])
})

export const printIncludeStatement = base((node: d.IncludeStatement) => {
  return b.concat(['include ', printStringLiteral(node.module), ';'])
})

export const printImportStatement = base((node: d.ImportStatement) => {
  return b.concat(['import ', printNode(node.module), ';'])
})

export const printCallStatement = base((node: d.CallStatement) => {
  return b.concat(['call ', printNode(node.subroutine), ';'])
})

export type DeclareValueType =
  | 'STRING'
  | 'BOOL'
  | 'BOOLEAN'
  | 'INTEGER'
  | 'FLOAT'

export const printDeclareStatement = base((node: d.DeclareStatement) => {
  return b.concat([
    'declare ',
    'local ',
    printNode(node.id, { neverBreak: true }),
    ' ',
    node.valueType,
    ';',
  ])
})

export const printAddStatement = base((node: d.AddStatement) => {
  return b.group(
    b.indent(
      b.concat([
        'add ',
        printNode(node.left, { neverBreak: true }),
        ' ',
        node.operator,
        b.line,
        printNode(node.right),
        ';',
      ])
    )
  )
})

export const printSetStatement = base((node: d.SetStatement) => {
  return b.group(
    b.indent(
      b.concat([
        'set ',
        printNode(node.left, { neverBreak: true }),
        ' ',
        node.operator,
        b.line,
        printNode(node.right, { neverBreak: true }),
        ';',
      ])
    )
  )
})

export const printUnsetStatement = base((node: d.UnsetStatement) => {
  return b.concat(['unset ', printNode(node.id, { neverBreak: true }), ';'])
})

export type ReturnActionName =
  | 'pass'
  | 'hit_for_pass'
  | 'lookup'
  | 'pipe'
  | 'deliver'

export const printReturnStatement = base((node: d.ReturnStatement) => {
  // TODO: handle the optional parens
  return b.concat(['return ', '(', node.action, ')', ';'])
})

export const printErrorStatement = base((node: d.ErrorStatement) => {
  return b.concat([
    b.join(
      ' ',
      [
        'error',
        node.status.toString(),
        node.message && printNode(node.message),
      ].filter(Boolean) as Array<Doc>
    ),
    ';',
  ])
})

export const printRestartStatement = base(() => {
  return 'restart;'
})

export const printSyntheticStatement = base((node: d.SyntheticStatement) => {
  return b.concat(['synthetic ', printNode(node.response), ';'])
})

export const printLogStatement = base((node: d.LogStatement) => {
  return b.concat(['log ', printNode(node.content), ';'])
})

export const printIfStatement = base((node: d.IfStatement) => {
  const doc = [
    'if ',
    b.group(
      b.concat([
        b.indent(
          b.concat(['(', b.ifBreak(b.hardline, ''), printNode(node.test)])
        ),
        b.ifBreak(b.hardline, ''),
        ') ',
      ])
    ),
    '{',
    b.indent(printStatements(node.consequent)),
    b.hardline,
    '}',
  ]

  if (node.alternative) {
    const alternative: Array<Doc> = Array.isArray(node.alternative)
      ? [
          ' else {',
          b.indent(printStatements(node.alternative)),
          b.hardline,
          '}',
        ]
      : [' else ', printIfStatement(node.alternative)]

    return b.concat([...doc, ...alternative])
  }

  return b.concat(doc)
})

export const printSubroutineStatement = base((node: d.SubroutineStatement) => {
  return b.concat([
    'sub ',
    printIdentifier(node.id),
    ' {',
    b.indent(printStatements(node.body)),
    b.hardline,
    '}',
  ])
})

export const printAclStatement = base((node: d.AclStatement) => {
  return b.concat([
    'acl ',
    printIdentifier(node.id),
    ' {',
    b.indent(
      b.concat([
        b.hardline,
        b.join(
          b.hardline,
          node.body.map((ip) => printIp(ip)).map((doc) => b.concat([doc, ';']))
        ),
      ])
    ),
    b.hardline,
    '}',
  ])
})

export const printBackendDefinition: PrinterFunc<d.BackendDefinition> = base(
  (node: d.BackendDefinition) => {
    const printedValue: Doc = Array.isArray(node.value)
      ? b.concat([
          '{',
          b.indent(
            b.concat([
              b.hardline,
              b.join(
                b.hardline,
                node.value.map((v) => printBackendDefinition(v))
              ),
            ])
          ),
          b.hardline,
          '}',
        ])
      : b.concat([printNode(node.value), ';'])

    return b.concat(['.', node.key, ' = ', printedValue])
  }
)

export const printBackendStatement = base((node: d.BackendStatement) => {
  return b.concat([
    'backend ',
    printIdentifier(node.id),
    ' ',
    b.concat([
      '{',
      b.indent(
        b.concat([
          b.hardline,
          b.join(
            b.hardline,
            node.body.map((d) => printBackendDefinition(d))
          ),
        ])
      ),
      b.hardline,
      '}',
    ]),
  ])
})

export const printTableDefinition = base((node: d.TableDefinition) => {
  return b.concat([node.key, ':', node.value])
})

/**
 * asdfasdf
 */

export const printTableStatement = base((node: d.TableStatement) => {
  return b.concat([
    'table ',
    printIdentifier(node.id),
    ' {',
    b.indent(
      b.concat([
        b.hardline,
        b.join(
          b.concat([',', b.hardline]),
          node.body.map((td) => printTableDefinition(td))
        ),
        // TODO: handle trailing comma
        // ',',
      ])
    ),
    b.hardline,
    '}',
  ])
})

export const printDirectorStatement = base((node: d.DirectorStatement) => {
  return b.concat([
    'director ',
    printIdentifier(node.id),
    ' ',
    printIdentifier(node.directorType),
    ' {',
    b.indent(
      b.concat([
        b.hardline,
        b.join(
          b.hardline,
          node.body.map((item) => {
            if ('backend' in item) {
              return b.concat([
                '{ ',
                b.join(' ', [
                  '.backend = ' + item.backend + ';',
                  ...item.attributes.map(
                    (attr) => '.' + attr.key + ' = ' + attr.value + ';'
                  ),
                ]),
                ' }',
              ])
            }
            return b.concat(['.' + item.key + ' = ' + item.value + ';'])
          })
        ),
      ])
    ),
    b.hardline,
    '}',
  ])
})
