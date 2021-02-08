/// <reference lib="dom"/>

import { Result } from '../result'

type DataType = 'code' | 'ast'

export class ResultPanel extends HTMLElement {
  textarea: HTMLTextAreaElement | null = null
  private buttons: Record<DataType, HTMLButtonElement | null> = {
    code: null,
    ast: null,
  }

  private type: DataType = 'code'
  private result?: Result

  public onResult = (result: Result) => {
    if (!this.textarea) return

    this.result = result
    this.textarea.disabled = false

    if (result.type === 'success') {
      this.textarea.value =
        this.type === 'code' ? result.code : JSON.stringify(result.ast, null, 2)
      this.textarea.classList.add('is-success')
      this.textarea.classList.remove('is-danger')
    } else {
      this.textarea.value = result.message
      this.textarea.classList.remove('is-success')
      this.textarea.classList.add('is-danger')
    }
  }

  private onClickCode = () => {
    this.type = 'code'

    this.buttons.code?.classList.add('is-info', 'is-selected')
    this.buttons.ast?.classList.remove('is-info', 'is-selected')

    this.result && this.onResult(this.result)
  }
  private onClickAST = () => {
    this.type = 'ast'

    this.buttons.code?.classList.remove('is-info', 'is-selected')
    this.buttons.ast?.classList.add('is-info', 'is-selected')

    this.result && this.onResult(this.result)
  }

  connectedCallback() {
    this.textarea = this.querySelector('textarea')
    this.buttons.code = this.querySelector('button[data-type=code]')
    this.buttons.ast = this.querySelector('button[data-type=ast]')

    this.buttons.code?.addEventListener('click', this.onClickCode)
    this.buttons.ast?.addEventListener('click', this.onClickAST)
  }

  disconnectedCallback() {
    this.buttons.code?.removeEventListener('click', this.onClickCode)
    this.buttons.ast?.removeEventListener('click', this.onClickAST)
  }
}
