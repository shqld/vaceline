import { Parser } from '../../src/parser'

describe('Statement', () => {
  describe('AclStatement', () => {
    it('should parse', () => {
      expect(() =>
        Parser.AclStatement.tryParse('acl sample_acls { "138.101.0.0"/16; }')
      ).not.toThrow()
    })
  })
})
