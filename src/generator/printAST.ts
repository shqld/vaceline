import { Doc, builders as b } from 'prettier/doc'
import { d, BaseNode } from '../nodes'

export interface State {
  lineNum: number
}

export const printNode = (
  node: d.Node,
  state: State,
  options?: object
): Doc => {
  switch (node.type) {
    case 'Program':
      return printProgram(node, state, options)

    case 'AclStatement':
      return printAclStatement(node, state, options)
    case 'AddStatement':
      return printAddStatement(node, state, options)
    case 'BackendStatement':
      return printBackendStatement(node, state, options)
    case 'CallStatement':
      return printCallStatement(node, state, options)
    case 'DeclareStatement':
      return printDeclareStatement(node, state, options)
    case 'ErrorStatement':
      return printErrorStatement(node, state, options)
    case 'ExpressionStatement':
      return printExpressionStatement(node, state, options)
    case 'IfStatement':
      return printIfStatement(node, state, options)
    case 'ImportStatement':
      return printImportStatement(node, state, options)
    case 'IncludeStatement':
      return printIncludeStatement(node, state, options)
    case 'LogStatement':
      return printLogStatement(node, state, options)
    case 'RestartStatement':
      return printRestartStatement(node, state, options)
    case 'ReturnStatement':
      return printReturnStatement(node, state, options)
    case 'SetStatement':
      return printSetStatement(node, state, options)
    case 'SubroutineStatement':
      return printSubroutineStatement(node, state, options)
    case 'SyntheticStatement':
      return printSyntheticStatement(node, state, options)
    case 'TableStatement':
      return printTableStatement(node, state, options)
    case 'UnsetStatement':
      return printUnsetStatement(node, state, options)

    case 'BooleanLiteral':
      return printBooleanLiteral(node, state, options)
    case 'DurationLiteral':
      return printDurationLiteral(node, state, options)
    case 'MultilineLiteral':
      return printMultilineLiteral(node, state, options)
    case 'NumericLiteral':
      return printNumericLiteral(node, state, options)
    case 'StringLiteral':
      return printStringLiteral(node, state, options)

    case 'BinaryExpression':
      return printBinaryExpression(node, state, options)
    case 'BooleanExpression':
      return printBooleanExpression(node, state, options)
    case 'ConcatExpression':
      return printConcatExpression(node, state, options)
    case 'FunCallExpression':
      return printFunCallExpression(node, state, options)
    case 'Identifier':
      return printIdentifier(node, state, options)
    case 'Ip':
      return printIp(node, state, options)
    case 'LogicalExpression':
      return printLogicalExpression(node, state, options)
    case 'Member':
      return printMember(node, state, options)
    case 'UnaryExpression':
      return printUnaryExpression(node, state, options)
    case 'ValuePair':
      return printValuePair(node, state, options)
    case 'BackendDefinition':
      return printBackendDefinition(node, state, options)
    case 'TableDefinition':
      return printTableDefinition(node, state, options)
  }
}

type PrinterFunc<T extends BaseNode, U extends object = object> = (
  node: T,
  state: State,
  options?: U
) => Doc

export const printStatements = (
  state: State,
  stmts: Array<d.Statement>
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

    doc.push(stmt.print(state), b.hardline)
    state.lineNum++
  }

  doc.pop()

  return b.concat(doc)
}

export const base = <T extends BaseNode, U extends object>(
  printer: PrinterFunc<T, U>
): PrinterFunc<T, U> => {
  return (node: T, state: State, options?: U) => {
    const printed = printer(node, state, options)
    // Some ops
    return printed
  }
}

export const printProgram = base((node: d.Program, state) => {
  return printStatements(state, node.body)
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
> = base((node, state, options) => {
  const { neverBreak = false, broken = false } = options ?? {}

  const shouldBreak =
    !neverBreak &&
    // break if child is also a Member or if also parent is already broken
    (node.base.type === 'Member' || broken)

  // printExpr('Member', state, {})
  return b.concat([
    b.group(
      b.concat([
        node.base.print(state, {
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

export const printValuePair = base((node: d.ValuePair, state) => {
  return b.concat([
    node.base.print(state),
    ':',
    printIdentifier(node.name, state),
  ])
})

export const printBooleanExpression = base(
  (node: d.BooleanExpression, state) => {
    return b.group(
      b.concat([
        b.indent(
          b.concat(['(', b.ifBreak(b.softline, ''), node.body.print(state)])
        ),
        b.ifBreak(b.softline, ''),
        ')',
      ])
    )
  }
)

export const printUnaryExpression = base((node: d.UnaryExpression, state) => {
  return b.concat([node.operator, node.argument.print(state)])
})

export const printFunCallExpression = base(
  (node: d.FunCallExpression, state) => {
    return b.concat([
      node.callee.print(state),
      '(',
      b.group(
        b.concat([
          b.indent(
            b.concat([
              b.ifBreak(b.line, ''),
              b.join(
                b.concat([',', b.line]),
                node.args.map((n) => n.print(state))
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

export const printConcatExpression = base((node: d.ConcatExpression, state) => {
  return b.group(
    b.indent(
      b.join(
        b.line,
        node.body.map((n) => n.print(state))
      )
    )
  )
})

export const printBinaryExpression: PrinterFunc<d.BinaryExpression> = base(
  (node: d.BinaryExpression, state) => {
    const left =
      node.left.type === 'BinaryExpression'
        ? b.concat(['(', printBinaryExpression(node.left, state), ')'])
        : node.left.print(state)

    return b.group(
      b.concat([
        left,
        ' ',
        b.indent(b.concat([node.operator, b.line, node.right.print(state)])),
      ])
    )
  }
)

export const printLogicalExpression: PrinterFunc<d.LogicalExpression> = base(
  (node: d.LogicalExpression, state) => {
    const left =
      node.left.type === 'LogicalExpression' &&
      node.operator === '||' &&
      node.left.operator === '&&'
        ? b.concat(['(', printLogicalExpression(node.left, state), ')'])
        : node.left.print(state)

    const right =
      node.right.type === 'LogicalExpression' &&
      node.operator === '||' &&
      node.right.operator === '&&'
        ? b.concat(['(', printLogicalExpression(node.right, state), ')'])
        : node.right.print(state)

    return b.group(
      b.concat([left, ' ', b.indent(b.concat([node.operator, b.line, right]))])
    )
  }
)

export const printExpressionStatement = base(
  (node: d.ExpressionStatement, state) => {
    return b.concat([node.body.print(state), ';'])
  }
)

export const printIncludeStatement = base((node: d.IncludeStatement, state) => {
  return b.concat(['include ', printStringLiteral(node.module, state), ';'])
})

export const printImportStatement = base((node: d.ImportStatement, state) => {
  return b.concat(['import ', node.module.print(state), ';'])
})

export const printCallStatement = base((node: d.CallStatement, state) => {
  return b.concat(['call ', node.subroutine.print(state), ';'])
})

export type DeclareValueType =
  | 'STRING'
  | 'BOOL'
  | 'BOOLEAN'
  | 'INTEGER'
  | 'FLOAT'

export const printDeclareStatement = base((node: d.DeclareStatement, state) => {
  return b.concat([
    'declare ',
    'local ',
    node.id.print(state, { neverBreak: true }),
    ' ',
    node.valueType,
    ';',
  ])
})

export const printAddStatement = base((node: d.AddStatement, state) => {
  return b.group(
    b.indent(
      b.concat([
        'add ',
        node.left.print(state, { neverBreak: true }),
        ' ',
        node.operator,
        b.line,
        node.right.print(state),
        ';',
      ])
    )
  )
})

export const printSetStatement = base((node: d.SetStatement, state) => {
  return b.group(
    b.indent(
      b.concat([
        'set ',
        node.left.print(state, { neverBreak: true }),
        ' ',
        node.operator,
        b.line,
        node.right.print(state, { neverBreak: true }),
        ';',
      ])
    )
  )
})

export const printUnsetStatement = base((node: d.UnsetStatement, state) => {
  return b.concat(['unset ', node.id.print(state, { neverBreak: true }), ';'])
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

export const printErrorStatement = base((node: d.ErrorStatement, state) => {
  return b.concat([
    b.join(
      ' ',
      [
        'error',
        node.status.toString(),
        node.message && node.message.print(state),
      ].filter(Boolean) as Array<Doc>
    ),
    ';',
  ])
})

export const printRestartStatement = base(() => {
  return 'restart;'
})

export const printSyntheticStatement = base(
  (node: d.SyntheticStatement, state) => {
    return b.concat(['synthetic ', node.response.print(state), ';'])
  }
)

export const printLogStatement = base((node: d.LogStatement, state) => {
  return b.concat(['log ', node.content.print(state), ';'])
})

export const printIfStatement = base((node: d.IfStatement, state) => {
  const doc = [
    'if ',
    b.group(
      b.concat([
        b.indent(
          b.concat(['(', b.ifBreak(b.hardline, ''), node.test.print(state)])
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
  (node: d.SubroutineStatement, state) => {
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

export const printAclStatement = base((node: d.AclStatement, state) => {
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

export const printBackendDefinition: PrinterFunc<d.BackendDefinition> = base(
  (node: d.BackendDefinition, state) => {
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
      : b.concat([node.value.print(state), ';'])

    return b.concat(['.', node.key, ' = ', printedValue])
  }
)

export const printBackendStatement = base((node: d.BackendStatement, state) => {
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

export const printTableDefinition = base((node: d.TableDefinition) => {
  return b.concat([node.key, ':', node.value])
})

export const printTableStatement = base((node: d.TableStatement, state) => {
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
