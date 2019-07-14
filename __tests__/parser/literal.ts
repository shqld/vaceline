import { parse } from '../../src'

describe('Literal', () => {
  describe('BooleanLiteral', () => {
    it('should parse', () => {
      {
        const node = Parser.BooleanLiteral.tryParse('true')
        expect(node.value).toBe('true')
      }
      {
        const node = Parser.BooleanLiteral.tryParse('false')
        expect(node.value).toBe('false')
      }
      {
        expect(() => Parser.BooleanLiteral.tryParse('string')).toThrow()
      }
    })
  })
  describe('StringLiteral', () => {
    it('should parse', () => {
      {
        const node = Parser.StringLiteral.tryParse('"string"')
        expect(node.value).toBe('string')
      }
      {
        expect(() =>
          Parser.StringLiteral.tryParse(`"
          multiline
        "`)
        ).toThrow()
      }
    })
  })

  describe('MultilineLiteral', () => {
    it('should parse', () => {
      {
        const node = Parser.MultilineLiteral.tryParse('{"string"}')
        expect(node.value).toBe('string')
      }
      {
        const node = Parser.MultilineLiteral.tryParse(`{"
multiline
"}`)
        expect(node.value).toBe('\nmultiline\n')
      }
      {
        expect(() => Parser.MultilineLiteral.tryParse('"string"')).toThrow()
      }
    })
  })

  describe('NumericLiteral', () => {
    it('should parse', () => {
      {
        const node = Parser.DurationLiteral.tryParse('100s')
        expect(node.value).toBe('100s')
      }
      {
        const node = Parser.DurationLiteral.tryParse('1m')
        expect(node.value).toBe('1m')
      }
      {
        expect(() => Parser.DurationLiteral.tryParse('100')).toThrow()
      }
    })
  })

  describe('NumericLiteral', () => {
    it('should parse', () => {
      {
        const node = Parser.NumericLiteral.tryParse('100')
        expect(node.value).toBe('100')
      }
      {
        const node = Parser.NumericLiteral.tryParse('0')
        expect(node.value).toBe('0')
      }
      // {
      //   // TODO:
      //   expect(() => Parser.NumericLiteral.tryParse('001')).toThrow()
      // }
    })
  })

  describe('IpLiteral', () => {
    it('should parse', () => {
      expect(() => Parser.IpLiteral.tryParse('"192.0.2.0"')).not.toThrow()
      expect(() => Parser.IpLiteral.tryParse('"192.0.2.0"/16')).not.toThrow()
      expect(() => Parser.IpLiteral.tryParse('"2001:db8::1"')).not.toThrow()
      expect(() =>
        Parser.IpLiteral.tryParse('"2002:c000:0204::"')
      ).not.toThrow() /* 6to4 mapping for "192.0.2.4" */
      expect(() =>
        Parser.IpLiteral.tryParse('"::FFFF:192.0.2.4"')
      ).not.toThrow() /* IPv4 mapping for "192.0.2.4" */
      expect(() => Parser.IpLiteral.tryParse('"::1"')).not.toThrow()
      expect(() =>
        Parser.IpLiteral.tryParse('"::"')
      ).not.toThrow() /* unspecified address */
    })
  })
})
