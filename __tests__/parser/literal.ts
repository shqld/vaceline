import { Parser } from '../../src/parser'

// @ts-ignore private method
const parseExpr = (source: string) => new Parser(source).parseExpr()

describe('Literal', () => {
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
      expect(parseExpr('string')).not.toMatchObject({
        type: 'BooleanLiteral',
      })
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
      ).toThrow()
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
      // TODO:
      expect(() => parseExpr('001')).toThrow()
    })
  })

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
