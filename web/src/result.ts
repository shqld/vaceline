import { BaseNode } from '@vaceline/types'

export type Result =
  | { type: 'success'; code: string; ast: BaseNode }
  | { type: 'error'; message: string }
