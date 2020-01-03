import path from 'path'
import webpack from 'webpack'
import rimraf from 'rimraf'
import { browser } from '../webpack'

const distWeb = path.resolve('public/dist')

const config: webpack.Configuration = {
  ...browser,
  mode: 'production',
  entry: path.resolve('src/web/index.ts'),
  output: {
    path: distWeb,
    filename: 'index.js',
  },
}

const compiler = webpack(config)

const isWatch = process.argv.includes('--watch')

compiler.hooks.beforeRun.tap('delete on start', () => {
  rimraf.sync(distWeb)
})

if (isWatch) {
  console.log('webpack: watching started')
  compiler.watch({}, (err, stats) => {
    if (err) console.error(err)

    console.log(stats.toString({ colors: true }))
  })
} else {
  compiler.run((err, stats) => {
    if (err) console.error(err)

    console.log(stats.toString({ colors: true }))
  })
}
