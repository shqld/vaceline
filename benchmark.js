const fs = require('fs')
const path = require('path')

const Bench = require('benchmark')

const { parse } = require('./dist')

const code = fs.readFileSync(
  path.resolve('__tests__/__fixture__/test.vcl'),
  'utf8'
)

const suite = new Bench.Suite()

suite
  .add('parse', () => {
    parse(code)
  })
  .on('cycle', (event) => {
    console.log(String(event.target))
  })
  .run({ async: true })
