/// <reference lib="dom"/>
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { parse, traverse, generate } from '../lib'

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

const source = document.getElementById('source')
const sourceTextarea = source?.querySelector('textarea')

const savedSource = localStorage.getItem('source')
if (savedSource) {
  sourceTextarea!.value = savedSource
}

sourceTextarea?.addEventListener('input', () => {
  localStorage.setItem('source', sourceTextarea.value)
})

const runTranspile = () => {
  let result: string

  const resultTextarea = document.querySelector(
    'div#result textarea'
  ) as HTMLTextAreaElement

  try {
    const parsed = parse(sourceTextarea!.value)
    result = generate(parsed).code
    resultTextarea?.classList.add('is-success')
    resultTextarea?.classList.remove('is-danger')
  } catch (err) {
    result = err.message
    resultTextarea?.classList.add('is-danger')
    resultTextarea?.classList.remove('is-success')
  }

  resultTextarea.disabled = false
  resultTextarea.value = result!
}

source?.querySelector('button')?.addEventListener('click', () => {
  runTranspile()
})

window.addEventListener('keydown', ({ code, metaKey }) => {
  if (code === 'Enter' && metaKey) {
    runTranspile()
  }
})
