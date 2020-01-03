import { BaseNode } from './nodes'

export const hydrate = (raw: string): BaseNode =>
  JSON.parse(raw, (_, value) => {
    if (value && typeof value.type === 'string') {
      // const node = Node.create(value.type as NodeType, value)

      // if (!node) {
      //   throw new Error('Unexpected JSON structure: ' + value.type)
      // }

      const node = Object.create(BaseNode.prototype)
      Object.assign(node, value)

      return node
    } else {
      return value
    }
  })
