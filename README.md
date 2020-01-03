# Vaceline — VCL Transpiler

Vaceline is a tool for trasforming VCL with JS plugins via AST.

_NOTE: this project is still in development._

## Install

```sh
yarn add -D vaceline
```

## Usage

```sh
yarn vaceline src -d dist
```

```sh
$ yarn vaceline --help

vaceline [source]

Transpile VCL

Positionals:
  source  Source file/dir to transpile                                  [string]

Options:
  --stdin        Accept input from stdin                               [boolean]
  --ast          Output as AST                                         [boolean]
  -d, --out-dir  Output dir                                             [string]
  --debug        Enable debug logging                                  [boolean]
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]

Examples:
  - vaceline path/to/file.vcl
  - vaceline path/to/dir
  - cat file | vaceline --stdin
  - vaceline file -d dist
```
