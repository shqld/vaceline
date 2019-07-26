import { Location } from './tokenizer'

export class Node {
  type!: string
  start?: number
  end?: number
  loc?: Location
}
