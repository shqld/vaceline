/* eslint-disable */

const fs = require('fs')
const path = require('path')
/** @type { import('prettier') } */
const prettier = require('prettier')
/** @type { import('ts-morph') } */
const morph = require('ts-morph')

const prettify = (source) =>
  prettier.format(source, {
    parser: 'typescript',
    ...JSON.parse(fs.readFileSync(path.resolve('.prettierrc'), 'utf8')),
  })

const { Project, SyntaxKind, ts } = morph

// initialize
const project = new Project({
  // Optionally specify compiler options, tsconfig.json, in-memory file system, and more here.
  // If you initialize with a tsconfig.json, then it will automatically populate the project
  // with the associated source files.
  // Read more: https://ts-morph.com/setup/
})

project.addSourceFileAtPath(path.resolve('src/nodes/defs.ts'))

const definitionsFile = project.getSourceFileOrThrow(
  path.resolve('src/nodes/defs.ts')
)

const defs = definitionsFile.getInterfaces()
const aliases = definitionsFile.getTypeAliases()

const buildersFile = project.createSourceFile(
  'src/nodes/builders.gen.ts',
  {},
  {
    overwrite: true,
  }
)

buildersFile.addImportDeclarations([
  {
    namespaceImport: 'd',
    moduleSpecifier: './defs',
  },
  {
    namedImports: [
      'Location',
      'BaseNode',
      'NodeWithLoc',
      'buildEmptryLocation',
    ],
    moduleSpecifier: './node',
  },
])

buildersFile.addFunctions(
  defs.map((def) => {
    const nodeName = def.getName()
    const props = def.getProperties().filter((p) => p.getName() !== 'type')

    return {
      isExported: true,
      name: 'build' + nodeName,
      returnType: `NodeWithLoc<${nodeName}>`,
      parameters: props
        .map((p) => p.getStructure())
        .concat({ name: 'loc', type: 'Location', hasQuestionToken: true }),
      statements: [
        `const node = Object.create(BaseNode.prototype) as NodeWithLoc<${nodeName}>`,
        '',
        `node.type = '${nodeName}'`,
        `node.loc = loc || buildEmptryLocation()`,
        '',
        ...props.map((p) => `node.${p.getName()} = ${p.getName()}`),
        '',
        'return node',
      ],
    }
  })
)

const buildersText = buildersFile.getText()

buildersFile.applyTextChanges([
  {
    newText: prettify(
      buildersText.replace(
        new RegExp(
          "([^\\w'])(" +
            defs
              .concat(aliases)
              .map((def) => def.getName())
              .join('|') +
            ")([^\\w'])",
          'g'
        ),
        '$1d.$2$3'
      )
    ),
    span: {
      length: buildersText.length,
      start: 0,
    },
  },
])

const nodesFile = project.createSourceFile(
  'src/nodes/nodes.gen.ts',
  {},
  {
    overwrite: true,
  }
)

nodesFile.addImportDeclarations([
  {
    namespaceImport: 'd',
    moduleSpecifier: './defs',
  },
])

nodesFile.addInterface({
  isExported: true,
  name: 'Nodes',
  properties: defs.map((def) => {
    return {
      name: def.getName(),
      type: 'd.' + def.getName(),
    }
  }),
})

const nodesText = nodesFile.getText()

nodesFile.applyTextChanges([
  {
    newText: prettify(nodesText),
    span: {
      length: buildersText.length,
      start: 0,
    },
  },
])

Promise.all([buildersFile.save(), nodesFile.save()])
