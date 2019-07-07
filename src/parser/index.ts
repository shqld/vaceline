import * as p from 'parsimmon'

import * as u from '../utils/index'
import * as n from '../nodes'
import { helpers as h, wrappers as w, symbols as s } from './lib'

import { LanguageWithLocation, Language } from './typings'
import { expression } from './expression'
import { createNode } from './create-node'
import { literal } from './literal'
import { statement } from './statement'

export const createParser = (opts: Partial<ParseOption>) =>
  p.createLanguage<LanguageWithLocation<Language>>({
    ...literal,
    ...expression,
    ...statement,

    File: (r) =>
      r.Program.map((program) => ({ program, filePath: opts.filePath! })).thru(
        createNode(n.File)
      ),

    Program: (r) =>
      p.optWhitespace
        .then(r.statement.thru(w.list))
        .map((body) => ({ body }))
        .thru(createNode(n.Program)),

    block: (r) =>
      r.statement
        .thru(w.list)
        .thru(w.bracket)
        .map(([lbracket, body, rbracket]) => ({
          lbracket,
          body,
          rbracket,
        }))
        .thru(createNode(n.Block)),

    customStatement: (r) =>
      opts.customDirectives
        ? h
            .grease(
              p.alt(...opts.customDirectives.map(h.directive)),
              r.expression.thru(w.list)
            )
            .map(([directive, body]) => ({
              directive,
              body,
            }))
            .thru(w.semi)
            .thru(createNode(n.CustomStatement))
        : p.alt(),
  })

interface ParseOption {
  filePath: string
  customDirectives: Array<string>
}

export const Parser = createParser({})

const parseFile = (parser: p.Language, input: string, filePath: string) => {
  try {
    const ast = parser.File.tryParse(input)
    ast.filePath = filePath

    return ast
  } catch (err) {
    err.message = err.message + '\n' + 'at: ' + filePath
    throw err
  }
}

const parseProgram = (parser: p.Language, input: string) =>
  parser.Program.tryParse(input)

export const parse = (input: string, opts: Partial<ParseOption> = {}) => {
  const parser = createParser(opts)

  if (opts.filePath) return parseFile(parser, input, opts.filePath)

  return parseProgram(parser, input)
}
