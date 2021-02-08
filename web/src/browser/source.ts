/// <reference lib="dom"/>

export class SourcePanel extends HTMLElement {
  private textarea: HTMLTextAreaElement | null = null
  private button: HTMLButtonElement | null = null

  public onSourceUpdate?: (source: string) => Promise<void>
  public get source(): string | undefined {
    return this.textarea?.value
  }

  private onClick = async () =>
    this.textarea?.value && this.onSourceUpdate?.(this.textarea.value)

  private onInput = (event: Event) => {
    const { value } = event.target as HTMLTextAreaElement
    localStorage.setItem('source', value)
  }

  private onKeyDown = async ({ code, metaKey }: KeyboardEvent) =>
    this.textarea?.value &&
    code === 'Enter' &&
    metaKey &&
    this.onSourceUpdate?.(this.textarea.value)

  connectedCallback() {
    this.textarea = this.querySelector('textarea')
    this.button = this.querySelector('button')

    this.textarea?.addEventListener('input', this.onInput)
    this.button?.addEventListener('click', this.onClick)
    this.addEventListener('keydown', this.onKeyDown)

    const inheritedSource =
      atob(location.hash.slice(1)) ?? localStorage.getItem('source')

    console.log(inheritedSource)

    if (this.textarea) this.textarea.value = inheritedSource
  }

  disconnectedCallback() {
    this.textarea?.removeEventListener('input', this.onInput)
    this.querySelector('button')?.removeEventListener('click', this.onClick)
    this.removeEventListener('keydown', this.onKeyDown)
  }
}
