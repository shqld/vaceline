import { BaseNode } from '../nodes'

export type Result =
  | { type: 'success'; code: string; ast: BaseNode }
  | { type: 'error'; message: string }
