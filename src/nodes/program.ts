import { BaseNode } from '.'
import { Statement } from './statement'

export interface Program extends BaseNode {
  type: 'Program'
  body: Array<Statement>
}
