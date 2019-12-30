import { Doc, doc as docHelpers } from 'prettier'
import * as n from '../nodes'

const { builders: b } = docHelpers

interface State {
  lineNum: number
}

export const printStatements = (
  state: State,
  stmts: Array<n.Statement>
): Doc => {
  const doc = []

  for (const stmt of stmts) {
    if (stmt.loc && stmt.loc.start.line > state.lineNum) {
      let delta = stmt.loc.start.line - state.lineNum
      while (delta--) {
        doc.push(b.hardline)
      }

      state.lineNum = stmt.loc.start.line
    }

    doc.push(printStmt(stmt, state), b.hardline)
    state.lineNum++
  }

  doc.pop()

  return b.concat(doc)
}

export const printNode = (node: n.Node, state: State): Doc => {
  switch (node.type) {
    case 'Program':
      return printProgram(node, state)

    case 'AclStatement':
      return printAclStatement(node, state)
    case 'AddStatement':
      return printAddStatement(node, state)
    case 'BackendStatement':
      return printBackendStatement(node, state)
    case 'CallStatement':
      return printCallStatement(node, state)
    case 'DeclareStatement':
      return printDeclareStatement(node, state)
    case 'ErrorStatement':
      return printErrorStatement(node, state)
    case 'ExpressionStatement':
      return printExpressionStatement(node, state)
    case 'IfStatement':
      return printIfStatement(node, state)
    case 'ImportStatement':
      return printImportStatement(node, state)
    case 'IncludeStatement':
      return printIncludeStatement(node, state)
    case 'LogStatement':
      return printLogStatement(node, state)
    case 'RestartStatement':
      return printRestartStatement(node, state)
    case 'ReturnStatement':
      return printReturnStatement(node, state)
    case 'SetStatement':
      return printSetStatement(node, state)
    case 'SubroutineStatement':
      return printSubroutineStatement(node, state)
    case 'SyntheticStatement':
      return printSyntheticStatement(node, state)
    case 'TableStatement':
      return printTableStatement(node, state)
    case 'UnsetStatement':
      return printUnsetStatement(node, state)

    case 'BooleanLiteral':
      return printBooleanLiteral(node, state)
    case 'DurationLiteral':
      return printDurationLiteral(node, state)
    case 'MultilineLiteral':
      return printMultilineLiteral(node, state)
    case 'NumericLiteral':
      return printNumericLiteral(node, state)
    case 'StringLiteral':
      return printStringLiteral(node, state)

    case 'BinaryExpression':
      return printBinaryExpression(node, state)
    case 'BooleanExpression':
      return printBooleanExpression(node, state)
    case 'ConcatExpression':
      return printConcatExpression(node, state)
    case 'FunCallExpression':
      return printFunCallExpression(node, state)
    case 'Identifier':
      return printIdentifier(node, state)
    case 'Ip':
      return printIp(node, state)
    case 'LogicalExpression':
      return printLogicalExpression(node, state)
    case 'Member':
      return printMember(node, state)
    case 'UnaryExpression':
      return printUnaryExpression(node, state)
    case 'ValuePair':
      return printValuePair(node, state)
  }
}

const printStmt = (stmt: n.Statement, state: State): Doc => {
  switch (stmt.type) {
    case 'AclStatement':
      return printAclStatement(stmt, state)
    case 'AddStatement':
      return printAddStatement(stmt, state)
    case 'BackendStatement':
      return printBackendStatement(stmt, state)
    case 'CallStatement':
      return printCallStatement(stmt, state)
    case 'DeclareStatement':
      return printDeclareStatement(stmt, state)
    case 'ErrorStatement':
      return printErrorStatement(stmt, state)
    case 'ExpressionStatement':
      return printExpressionStatement(stmt, state)
    case 'IfStatement':
      return printIfStatement(stmt, state)
    case 'ImportStatement':
      return printImportStatement(stmt, state)
    case 'IncludeStatement':
      return printIncludeStatement(stmt, state)
    case 'LogStatement':
      return printLogStatement(stmt, state)
    case 'RestartStatement':
      return printRestartStatement(stmt, state)
    case 'ReturnStatement':
      return printReturnStatement(stmt, state)
    case 'SetStatement':
      return printSetStatement(stmt, state)
    case 'SubroutineStatement':
      return printSubroutineStatement(stmt, state)
    case 'SyntheticStatement':
      return printSyntheticStatement(stmt, state)
    case 'TableStatement':
      return printTableStatement(stmt, state)
    case 'UnsetStatement':
      return printUnsetStatement(stmt, state)
  }
}

const printExpr: PrinterFunc<n.Expression> = (expr, state) => {
  switch (expr.type) {
    case 'BooleanLiteral':
      return printBooleanLiteral(expr, state)
    case 'DurationLiteral':
      return printDurationLiteral(expr, state)
    case 'MultilineLiteral':
      return printMultilineLiteral(expr, state)
    case 'NumericLiteral':
      return printNumericLiteral(expr, state)
    case 'StringLiteral':
      return printStringLiteral(expr, state)

    case 'BinaryExpression':
      return printBinaryExpression(expr, state)
    case 'BooleanExpression':
      return printBooleanExpression(expr, state)
    case 'ConcatExpression':
      return printConcatExpression(expr, state)
    case 'FunCallExpression':
      return printFunCallExpression(expr, state)
    case 'Identifier':
      return printIdentifier(expr, state)
    case 'Ip':
      return printIp(expr, state)
    case 'LogicalExpression':
      return printLogicalExpression(expr, state)
    case 'Member':
      return printMember(expr, state)
    case 'UnaryExpression':
      return printUnaryExpression(expr, state)
    case 'ValuePair':
      return printValuePair(expr, state)
  }
}

type PrinterFunc<T extends n.BaseNode, U extends object = object> = (
  node: T,
  state: State,
  options?: U
) => Doc

const base = <T extends n.BaseNode, U extends object>(
  printer: PrinterFunc<T, U>
): PrinterFunc<T, U> => {
  return (node: T, state: State, options?: U) => {
    const printed = printer(node, state, options)
    // Some ops
    return printed
  }
}

export const printProgram = base((node: n.Program, state) => {
  return printStatements(state, node.body)
})

export const printBooleanLiteral = base((node: n.BooleanLiteral) => {
  return node.value
})

export const printStringLiteral = base((node: n.StringLiteral) => {
  return node.value
})

export const printMultilineLiteral = base((node: n.MultilineLiteral) => {
  return node.value
})

export const printDurationLiteral = base((node: n.DurationLiteral) => {
  return node.value
})

export const printNumericLiteral = base((node: n.NumericLiteral) => {
  return node.value
})

export const printIdentifier = base((node: n.Identifier) => {
  return node.name
})

export const printIp = base((node: n.Ip) => {
  return node.cidr ? `"${node.value}"/${node.cidr}` : `"${node.value}"`
})

export const printMember: PrinterFunc<
  n.Member,
  { neverBreak?: boolean; broken?: boolean }
> = base((node, state, options) => {
  const { neverBreak = false, broken = false } = options ?? {}

  const shouldBreak =
    !neverBreak &&
    // break if child is also a Member or if also parent is already broken
    (node.base instanceof n.Member || broken)

  // printExpr('Member', state, {})
  return b.concat([
    b.group(
      b.concat([
        node.base.type === 'Identifier'
          ? printIdentifier(node.base, state)
          : printMember(node.base, state, {
              neverBreak,
              broken: shouldBreak,
            }),
        b.indent(
          b.concat([
            shouldBreak ? b.softline : '',
            '.',
            printIdentifier(node.member, state),
          ])
        ),
      ])
    ),
  ])
})

export const printValuePair = base((node: n.ValuePair, state) => {
  return b.concat([
    node.base.type === 'Identifier'
      ? printIdentifier(node.base, state)
      : printMember(node.base, state),
    ':',
    printIdentifier(node.name, state),
  ])
})

export const printBooleanExpression = base(
  (node: n.BooleanExpression, state) => {
    return b.group(
      b.concat([
        b.indent(
          b.concat([
            '(',
            b.ifBreak(b.softline, ''),
            printExpr(node.body, state),
          ])
        ),
        b.ifBreak(b.softline, ''),
        ')',
      ])
    )
  }
)

export const printUnaryExpression = base((node: n.UnaryExpression, state) => {
  return b.concat([node.operator, printExpr(node.argument, state)])
})

export const printFunCallExpression = base(
  (node: n.FunCallExpression, state) => {
    return b.concat([
      node.callee instanceof n.Identifier
        ? printIdentifier(node.callee, state)
        : node.callee instanceof n.Member
        ? printMember(node.callee, state)
        : printValuePair(node.callee, state),
      '(',
      b.group(
        b.concat([
          b.indent(
            b.concat([
              b.ifBreak(b.line, ''),
              b.join(
                b.concat([',', b.line]),
                node.arguments.map((n) => printExpr(n, state))
              ),
              b.ifBreak(',', ''),
            ])
          ),
          b.ifBreak(b.line, ''),
        ])
      ),
      ')',
    ])
  }
)

export const printConcatExpression = base((node: n.ConcatExpression, state) => {
  return b.group(
    b.indent(
      b.join(
        b.line,
        node.body.map((n) => printExpr(n, state))
      )
    )
  )
})

export const printBinaryExpression: PrinterFunc<n.BinaryExpression> = base(
  (node: n.BinaryExpression, state) => {
    const left =
      node.left instanceof n.BinaryExpression
        ? b.concat(['(', printBinaryExpression(node.left, state), ')'])
        : printExpr(node.left, state)

    return b.group(
      b.concat([
        left,
        ' ',
        b.indent(
          b.concat([node.operator, b.line, printExpr(node.right, state)])
        ),
      ])
    )
  }
)

export const printLogicalExpression: PrinterFunc<n.LogicalExpression> = base(
  (node: n.LogicalExpression, state) => {
    const left =
      node.left instanceof n.LogicalExpression &&
      node.operator === '||' &&
      node.left.operator === '&&'
        ? b.concat(['(', printLogicalExpression(node.left, state), ')'])
        : printExpr(node.left, state)

    const right =
      node.right instanceof n.LogicalExpression &&
      node.operator === '||' &&
      node.right.operator === '&&'
        ? b.concat(['(', printLogicalExpression(node.right, state), ')'])
        : printExpr(node.right, state)

    return b.group(
      b.concat([left, ' ', b.indent(b.concat([node.operator, b.line, right]))])
    )
  }
)

export const printExpressionStatement = base(
  (node: n.ExpressionStatement, state) => {
    return b.concat([printExpr(node.body, state), ';'])
  }
)

export const printIncludeStatement = base((node: n.IncludeStatement, state) => {
  return b.concat(['include ', printStringLiteral(node.module, state), ';'])
})

export const printImportStatement = base((node: n.ImportStatement, state) => {
  return b.concat(['import ', printExpr(node.module, state), ';'])
})

export const printCallStatement = base((node: n.CallStatement, state) => {
  return b.concat(['call ', printExpr(node.subroutine, state), ';'])
})

export type DeclareValueType =
  | 'STRING'
  | 'BOOL'
  | 'BOOLEAN'
  | 'INTEGER'
  | 'FLOAT'

export const printDeclareStatement = base((node: n.DeclareStatement, state) => {
  return b.concat([
    'declare ',
    'local ',
    node.id.type === 'Identifier'
      ? printIdentifier(node.id, state, { neverBreak: true })
      : printMember(node.id, state, { neverBreak: true }),
    ' ',
    node.valueType,
    ';',
  ])
})

export const printAddStatement = base((node: n.AddStatement, state) => {
  return b.group(
    b.indent(
      b.concat([
        'add ',
        node.left.type === 'Identifier'
          ? printIdentifier(node.left, state, { neverBreak: true })
          : printMember(node.left, state, { neverBreak: true }),
        ' ',
        node.operator,
        b.line,
        printExpr(node.right, state),
        ';',
      ])
    )
  )
})

export const printSetStatement = base((node: n.SetStatement, state) => {
  return b.group(
    b.indent(
      b.concat([
        'set ',
        node.left.type === 'Identifier'
          ? printIdentifier(node.left, state)
          : printMember(node.left, state, { neverBreak: true }),
        ' ',
        node.operator,
        b.line,
        printExpr(node.right, state, { neverBreak: true }),
        ';',
      ])
    )
  )
})

export const printUnsetStatement = base((node: n.UnsetStatement, state) => {
  return b.concat([
    'unset ',
    node.id.type === 'Identifier'
      ? printIdentifier(node.id, state)
      : printMember(node.id, state, { neverBreak: true }),
    ';',
  ])
})

export type ReturnActionName =
  | 'pass'
  | 'hit_for_pass'
  | 'lookup'
  | 'pipe'
  | 'deliver'

export const printReturnStatement = base((node: n.ReturnStatement) => {
  // TODO: handle the optional parens
  return b.concat(['return ', '(', node.action, ')', ';'])
})

export const printErrorStatement = base((node: n.ErrorStatement, state) => {
  return b.concat([
    b.join(
      ' ',
      [
        'error',
        node.status.toString(),
        node.message && printExpr(node.message, state),
      ].filter(Boolean) as Array<Doc>
    ),
    ';',
  ])
})

export const printRestartStatement = base(() => {
  return 'restart;'
})

export const printSyntheticStatement = base(
  (node: n.SyntheticStatement, state) => {
    return b.concat(['synthetic ', printExpr(node.response, state), ';'])
  }
)

export const printLogStatement = base((node: n.LogStatement, state) => {
  return b.concat(['log ', printExpr(node.content, state), ';'])
})

export const printIfStatement = base((node: n.IfStatement, state) => {
  const doc = [
    'if ',
    b.group(
      b.concat([
        b.indent(
          b.concat([
            '(',
            b.ifBreak(b.hardline, ''),
            printExpr(node.test, state),
          ])
        ),
        b.ifBreak(b.hardline, ''),
        ') ',
      ])
    ),
    '{',
    b.indent(printStatements(state, node.consequent)),
    b.hardline,
    '}',
  ]

  if (node.alternative) {
    const alternative: Array<Doc> = Array.isArray(node.alternative)
      ? [
          ' else {',
          b.indent(printStatements(state, node.alternative)),
          b.hardline,
          '}',
        ]
      : [' else ', printIfStatement(node.alternative, state)]

    return b.concat([...doc, ...alternative])
  }

  return b.concat(doc)
})

export const printSubroutineStatement = base(
  (node: n.SubroutineStatement, state) => {
    return b.concat([
      'sub ',
      printIdentifier(node.id, state),
      ' {',
      b.indent(printStatements(state, node.body)),
      b.hardline,
      '}',
    ])
  }
)

export const printAclStatement = base((node: n.AclStatement, state) => {
  return b.concat([
    'acl ',
    printIdentifier(node.id, state),
    ' {',
    b.indent(
      b.concat([
        b.hardline,
        b.join(
          b.hardline,
          node.body
            .map((ip) => printIp(ip, state))
            .map((doc) => b.concat([doc, ';']))
        ),
      ])
    ),
    b.hardline,
    '}',
  ])
})

export const printBackendDefinition: PrinterFunc<n.BackendDefinition> = base(
  (node: n.BackendDefinition, state) => {
    const printedValue: Doc = Array.isArray(node.value)
      ? b.concat([
          '{',
          b.indent(
            b.concat([
              b.hardline,
              b.join(
                b.hardline,
                node.value.map((v) => printBackendDefinition(v, state))
              ),
            ])
          ),
          b.hardline,
          '}',
        ])
      : b.concat([printExpr(node.value, state), ';'])

    return b.concat(['.', node.key, ' = ', printedValue])
  }
)

export const printBackendStatement = base((node: n.BackendStatement, state) => {
  return b.concat([
    'backend ',
    printIdentifier(node.id, state),
    ' ',
    b.concat([
      '{',
      b.indent(
        b.concat([
          b.hardline,
          b.join(
            b.hardline,
            node.body.map((d) => printBackendDefinition(d, state))
          ),
        ])
      ),
      b.hardline,
      '}',
    ]),
  ])
})

export const printTableDefinition = base((node: n.TableDefinition) => {
  return b.concat([node.key, ':', node.value])
})

export const printTableStatement = base((node: n.TableStatement, state) => {
  return b.concat([
    'table ',
    printIdentifier(node.id, state),
    ' {',
    b.indent(
      b.concat([
        b.hardline,
        b.join(
          b.concat([',', b.hardline]),
          node.body.map((td) => printTableDefinition(td, state))
        ),
        // TODO: handle trailing comma
        // ',',
      ])
    ),
    b.hardline,
    '}',
  ])
})
