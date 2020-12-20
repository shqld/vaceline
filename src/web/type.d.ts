import { Node } from '../nodes'

export type Result =
  | { type: 'success'; code: string; ast: Node }
  | { type: 'error'; message: string }
