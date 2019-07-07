import * as nodes from './nodes'

export const hydrate = (raw: string): nodes.Node =>
  JSON.parse(raw, (_, value) => {
    if (value && value.type) {
      // @ts-ignore
      const Node = nodes[value.type]

      if (!Node.create) {
        throw new Error('Unexpected JSON structure: ' + value.type)
      }

      return Node.create(value)
    } else {
      return value
    }
  })
