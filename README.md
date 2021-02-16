# Vaceline — VCL Transpiler

Vaceline is a tool for trasforming VCL with JS plugins via AST.

_NOTE: this project is still in development._

You can [try it on the Web now](https://shqld.github.io/vaceline) (also still beta)

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
  --ast          Output as AST                                         [boolean]
  --out-dir, -d  Output dir                                             [string]
  --silent, -s   Disable any logging                  [boolean] [default: false]
  --debug        Enable debug logging                 [boolean] [default: false]
  --minify                                             [boolean] [default: true]
  --no-comments                                        [boolean] [default: true]
  --printWidth                                            [number] [default: 80]
  --tabWidth                                               [number] [default: 2]
  --useTabs                                           [boolean] [default: false]
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]

Examples:
  - vaceline path/to/file.vcl
  - vaceline path/to/dir
  - cat file | vaceline
  - vaceline file -d dist
```
