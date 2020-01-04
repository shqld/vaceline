// Back to JavaScript due to typing collision between dom and webworker

/// <reference no-default-lib="true"/>
/// <reference lib="webworker"/>

import * as Comlink from 'comlink'

const transpile = async (source) => {
  try {
    const { parse, traverse, generate } = await import('../lib')

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
