import fs from 'fs'
import path from 'path'
import yargs from 'yargs'
import assert from 'assert'
import { GenerateOptions } from '../generator'

export type CliOptions = GenerateOptions & {
  source: string
  stdin: boolean
  ast: boolean
  outDir: string
  debug: boolean
  silent: boolean
}

export const optionParser = yargs
  .locale('en')
  .scriptName('vaceline')
  .alias('h', 'help')
  .alias('v', 'version')
  .strict()
  .usage('$0 [source]', 'Transpile VCL', (y) =>
    y
      // meta options such as `example` are currently not
      // working where there is only a default command
      // nesting definitions seems work around
      // https://github.com/yargs/yargs/issues/1331
      .showHelpOnFail(false, 'Specify --help for available options\n')
      .example('- $0 path/to/file.vcl', '')
      .example('- $0 path/to/dir', '')
      .example('- cat file | $0 --stdin', '')
      .example('- $0 file -d dist', '')

      .positional('source', {
        type: 'string',
        desc: 'Source file/dir to transpile',
        coerce: path.resolve,
      })
      .check((opts: Partial<CliOptions>) => {
        if (!opts.stdin) {
          assert(opts.source, new Error('source must be present'))
          assert(
            fs.existsSync(opts.source as string),
            new Error('File not found at ' + opts.source)
          )
        }

        if (opts.source && opts.stdin) {
          throw new Error(
            'source and --stdin cannot be passed at the same time'
          )
        }

        return true
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
      .option('out-dir', {
        type: 'string',
        alias: 'd',
        desc: 'Output dir',
        coerce: path.resolve,
        normalize: true,
      })
      // .option('o', {
      //   type: 'string',
      //   alias: 'out-file',
      //   desc: 'Output File',
      //   coerce: path.resolve,
      // })
      .option('silent', {
        type: 'boolean',
        alias: 's',
        desc: 'Disable any logging',
        default: false,
      })
      .option('debug', {
        type: 'boolean',
        desc: 'Enable debug logging',
        default: false,
      })
      .option('minify', {
        type: 'boolean',
        default: true,
      })
      .option('no-comments', {
        type: 'boolean',
        default: true,
      })
      .option('printWidth', {
        type: 'number',
        default: 80,
      })
      .option('tabWidth', {
        type: 'number',
        default: 2,
      })
      .option('useTabs', {
        type: 'boolean',
        default: false,
      })
  ) as yargs.Argv<CliOptions>
