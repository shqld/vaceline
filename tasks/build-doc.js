/* eslint-disable */

const fs = require('fs')
const path = require('path')
/** @type { import('prettier') } */
const prettier = require('prettier')
/** @type { import('ts-morph') } */
const morph = require('ts-morph')

const prettify = (source) =>
  prettier.format(source, {
    parser: 'markdown',
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

const toc = []
const nodes = []

for (const def of defs) {
  const defName = def.getName()

  toc.push(`- [${defName}](${defName})`)

  nodes.push(
    [
      `## ${defName}`,
      '```tsx',
      def
        .getText()
        .replace('extends', '<:')
        .replace('export ', ''),
      '```',
      def
        .getJsDocs()
        .map((d) => d.getDescription())
        .join('\n'),
    ]
      .filter(Boolean)
      .join('\n')
  )
}

const doc = prettify([toc.join('\n'), '\n\n', ...nodes.join('\n\n')].join(''))

fs.writeFileSync(path.resolve('docs/nodes.gen.md'), doc)
