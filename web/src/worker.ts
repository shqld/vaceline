// Back to JavaScript due to typing collision between dom and webworker

import * as Comlink from 'comlink'
import { parse } from '@vaceline/parser'
import { generate } from '@vaceline/generator'

const transpile = async (source: string) => {
  try {
    const ast = parse(source)
    const { code } = generate(ast)

    return { type: 'success', code, ast }
  } catch (err) {
    return {
      type: 'error',
      message: err.message,
    }
  }
}

Comlink.expose(transpile)
