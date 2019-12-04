import fs from 'fs'
import path from 'path'
import yargs from 'yargs'

export interface Options {
  source: string
  stdin: boolean
  ast: boolean
  d: string
  debug: boolean
}

export const optionParser = yargs
  .scriptName('vaceline')
  .locale('en')
  .showHelpOnFail(false, 'Specify --help for available options')
  .usage('$0 [source]', 'transpile VCL', (y) => {
    y.positional('source', {
      type: 'string',
      desc: 'Source file/dir to transpile',
      coerce: path.resolve,
    }).conflicts('source', 'stdin')

    if (!y.argv.stdin) {
      y.demand(['source'])
    }

    return y
  })
  .option('stdin', {
    type: 'boolean',
    desc: 'Accept input from stdin',
    coerce: Boolean,
  })
  .option('ast', {
    type: 'boolean',
    desc: 'Output as AST',
    coerce: Boolean,
  })
  .option('d', {
    type: 'string',
    alias: 'out-dir',
    desc: 'Output dir',
    coerce: path.resolve,
  })
  // .option('o', {
  //   type: 'string',
  //   alias: 'out-file',
  //   desc: 'Output File',
  //   coerce: path.resolve,
  // })
  .option('debug', {
    desc: 'Enable debug logging',
    coerce: Boolean,
  }) as yargs.Argv<Options>
