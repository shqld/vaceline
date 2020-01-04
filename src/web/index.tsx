/// <reference lib="dom"/>
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* @jsx h */

import { h, hydrate } from 'preact'
import { useState } from 'preact/hooks'

import { parse, traverse, generate } from '../lib'
import { BaseNode } from '../nodes'

import { SourcePanel } from './source'
import { ResultPanel } from './result'

declare global {
  interface Window {
    parse: typeof parse
    traverse: typeof traverse
    generate: typeof generate
  }
}

window.parse = parse
window.traverse = traverse
window.generate = generate

export type Result =
  | { type: 'success'; code: string; ast: BaseNode }
  | { type: 'error'; message: string }

export const runTranspile = (source: string): Result => {
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

const App = () => {
  const [result, setResult] = useState<Result | null>(null)

  return (
    <main id="main" class="section">
      <h1 className="title">Vaceline</h1>

      <div className="columns">
        <div className="column">
          <SourcePanel setResult={setResult} />
        </div>

        <div className="column">
          <ResultPanel result={result} />
        </div>
      </div>
    </main>
  )
}

hydrate(<App />, document.body!)
