/* @jsx h */
import { h, ComponentType } from 'preact'
import { useState } from 'preact/hooks'
import { Result } from './type'

export const ResultPanel: ComponentType<{ result: Result | null }> = ({
  result,
}) => {
  const [type, setType] = useState<'code' | 'ast'>('code')

  const text = result
    ? result.type === 'success'
      ? type === 'code'
        ? result.code
        : JSON.stringify(result.ast, null, 2)
      : result.message
    : ''

  const className = [
    'textarea',
    'is-family-code',
    result && result.type === 'success' && 'is-success',
    result && result.type === 'error' && 'is-danger',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div id="result" class="container">
      <h2 class="subtitle">result</h2>
      <textarea
        class={className}
        rows={20}
        placeholder="The result will be output here"
        value={text}
        disabled={!result}
        readOnly
      />
      <div id="render" class="buttons has-addons">
        <button
          class={type === 'code' ? 'button is-info is-selected' : 'button'}
          onClick={() => setType('code')}
        >
          Code
        </button>
        <button
          class={type === 'ast' ? 'button is-info is-selected' : 'button'}
          onClick={() => setType('ast')}
        >
          AST
        </button>
      </div>
    </div>
  )
}
