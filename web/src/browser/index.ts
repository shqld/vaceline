/// <reference lib="dom"/>

import * as Comlink from 'comlink'

import { Result } from '../result'
import { SourcePanel } from './source'
import { ResultPanel } from './result'

// @ts-expect-error
const transpile: (source: string) => Promise<Result> = Comlink.wrap(
  new Worker('./worker.js')
)

main()

function main() {
  window.customElements.define('vaceline-source-panel', SourcePanel)
  window.customElements.define('vaceline-result-panel', ResultPanel)

  const sourcePanel: SourcePanel | null = document.querySelector(
    'vaceline-source-panel'
  )
  const resultPanel: ResultPanel | null = document.querySelector(
    'vaceline-result-panel'
  )

  if (sourcePanel && resultPanel) {
    sourcePanel.onSourceUpdate = async (source) =>
      resultPanel.onResult(await transpile(source))

    document
      .querySelector('button[data-share]')
      ?.addEventListener('click', () => {
        location.hash = btoa(sourcePanel.source ?? '')
      })
  }
}
