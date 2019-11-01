# Vaceline — VCL Transpiler

Vaceline is a tool for trasforming VCL with JS plugins via AST.

*NOTE: this project is currently in development.*


## Usage

```sh
yarn vaceline path/to/VCL(dir|file)
cat path/to/VCL | yarn vaceline --stdin
```

```sh
$ yarn vaceline --help

vaceline [source]

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
