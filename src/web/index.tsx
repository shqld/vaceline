/// <reference lib="dom"/>
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* @jsx h */

import { h, hydrate } from 'preact'
import { useState, useEffect } from 'preact/hooks'

import { SourcePanel } from './source'
import { ResultPanel } from './result'
import { Result } from './type'

declare global {
  function requestIdleCallback(): void
}

const preloadHrefs = ['./dist/1.worker.js', './dist/2.worker.js']

const raf =
  typeof requestIdleCallback !== 'undefined'
    ? requestIdleCallback
    : setImmediate

const App = () => {
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    raf(() => {
      preloadHrefs.forEach((href) => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = href
        link.as = 'script'
        document.head.appendChild(link)
      })
    })
  }, [])

  return (
    <main id="main" class="section">
      <h1 class="title">
        <a
          href="https://shqld.github.io/vaceline"
          style="vertical-align: top; margin-right: 1rem;"
        >
          Vaceline
        </a>
        <a
          href="https://github.com/shqld/vaceline"
          style="vertical-align: top;"
        >
          <img src="./i-github.png" alt="vaceline" style="height: 2rem;" />
        </a>
      </h1>

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
