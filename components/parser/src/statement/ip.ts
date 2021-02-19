import { Parser } from '..'
import { isToken } from '@vaceline/utils'
import isIp from 'is-ip'
import { createError } from '../create-error'

export function parseIp(p: Parser, token = p.read()) {
  return p.parseNode(token, () => {
    // TODO: We can know what Ip addresses look like and detect them
    // so it should be parsed not as StringLiteral even outside of AclStatement

    const str = p.validateToken(token, 'string')
    const value = str.value.slice(1, -1) // strip quotes

    const isLocalhost = value === 'localhost'
    const version = isIp.version(value)

    if (!isLocalhost && !version) {
      throw createError(
        p.source,
        'Invalid ip address, Expected `"localhost"`, "IP"`, or `"IP"/prefix`',
        token.loc.start,
        token.loc.end
      )
    }

    let cidr = undefined

    if (isToken(p.peek(), 'symbol', '/')) {
      p.take()

      const token = p.validateToken(p.read(), 'numeric')
      cidr = Number(token.value)

      let message
      if (isLocalhost && cidr != undefined) {
        message = 'A prefix length is not supported for `localhost`'
      }

      if (version === 4 && (cidr < 0 || 32 < cidr)) {
        message = 'IPv4 prefix length must be between 0 and 32'
      }

      if (version === 6 && (cidr < 0 || 128 < cidr)) {
        message = 'IPv6 prefix length must be between 0 and 128'
      }

      if (message) {
        throw createError(
          p.source,
          `Invalid ip address(${message})`,
          token.loc.start,
          token.loc.end
        )
      }
    }

    return { type: 'Ip', value, cidr }
  })
}
