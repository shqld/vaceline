# Vacel — VCL Transpiler

Vacel is a tool for trasforming VCL with JS plugins via AST.

*NOTE: this project is currently in development.*


## Usage

```sh
yarn vacel path/to/VCL(dir|file)
cat path/to/VCL | yarn vacel --stdin
```

```sh
$ yarn vacel --help

vacel [source]

transpile VCL

Positionals:
  source  Source file/dir to transpile                                  [string]

Options:
  --help         Show help                                             [boolean]
  --version      Show version number                                   [boolean]
  --ast          Output as AST                                         [boolean]
  -d, --out-dir  Output dir                                             [string]
  --stdin        Accept input from stdin                               [boolean]
  --debug        Enable debug logging
```
