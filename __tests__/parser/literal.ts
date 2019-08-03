import { parseLiteral } from '../../src/parser/literal'
import { Parser } from '../../src/parser'

describe('Literal', () => {
  const parseExpr = (source: string) => parseLiteral(new Parser(source))

  describe('BooleanLiteral', () => {
    it('should parse', () => {
      expect(parseExpr('true')).toMatchObject({
        type: 'BooleanLiteral',
        value: 'true',
      })
      expect(parseExpr('false')).toMatchObject({
        type: 'BooleanLiteral',
        value: 'false',
      })
      expect(parseExpr('string')).toBeNull()
    })
  })

  describe('StringLiteral', () => {
    it('should parse', () => {
      expect(parseExpr('"hello"')).toMatchObject({
        type: 'StringLiteral',
        value: '"hello"',
      })
      expect(() =>
        parseExpr(`"
          multiline
        "`)
      ).toThrowError(/invalid token/)
    })
  })

  describe('MultilineLiteral', () => {
    it('should parse', () => {
      expect(parseExpr('{"hello"}')).toMatchObject({
        type: 'StringLiteral',
        value: '{"hello"}',
      })
      expect(
        parseExpr(`{"
multiline
"}`)
      ).toMatchObject({
        type: 'StringLiteral',
        value: '{"\nmultiline\n"}',
      })
    })
  })

  describe('DurationLiteral', () => {
    it('should parse', () => {
      expect(parseExpr('100s')).toMatchObject({
        type: 'DurationLiteral',
        value: '100s',
      })

      expect(parseExpr('1m')).toMatchObject({
        type: 'DurationLiteral',
        value: '1m',
      })

      expect(() => parseExpr('10a')).toThrowError(/invalid token/)
    })
  })

  describe('NumericLiteral', () => {
    it('should parse', () => {
      expect(parseExpr('100')).toMatchObject({
        type: 'NumericLiteral',
        value: '100',
      })

      expect(parseExpr('0')).toMatchObject({
        type: 'NumericLiteral',
        value: '0',
      })

      expect(() => parseExpr('001')).toThrowError(/invalid number/)

      expect(() => parseExpr('.11')).toThrow(/invalid token/)
      expect(() => parseExpr('0.')).toThrow(/invalid number/)
    })
  })

  // TODO:
  describe('IpLiteral', () => {
    it('should parse', () => {
      expect(parseExpr('"192.0.2.0"')).toMatchObject({
        type: 'IpLiteral',
      })
      expect(parseExpr('"192.0.2.0"/16')).toMatchObject({
        type: 'IpLiteral',
      })
      expect(parseExpr('"2001:db8::1"')).toMatchObject({
        type: 'IpLiteral',
      })

      /* 6to4 mapping for "192.0.2.4" */
      expect(parseExpr('"2002:c000:0204::"')).toMatchObject({
        type: 'IpLiteral',
      })
      expect(parseExpr('"::FFFF:192.0.2.4"')).toMatchObject({
        type: 'IpLiteral',
      })
      expect(parseExpr('"::1"')).toMatchObject({
        type: 'IpLiteral',
      })

      /* unspecified address */
      expect(parseExpr('"::"')).toMatchObject({
        type: 'IpLiteral',
      })
    })
  })
})
