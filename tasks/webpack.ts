import path from 'path'
import webpack from 'webpack'
import rimraf from 'rimraf'
import { browser } from '../webpack'
import WebpackBar from 'webpackbar'
// eslint-disable-next-line
const VisualizerPlugin = require('webpack-visualizer-plugin')

const distWeb = path.resolve('public/dist')

const config: Array<webpack.Configuration> = [
  {
    ...browser,
    mode: 'production',
    entry: path.resolve('src/web/index.tsx'),
    output: {
      path: distWeb,
      filename: 'index.js',
    },
    plugins: [
      new VisualizerPlugin(),
      new WebpackBar({
        name: 'browser',
        color: 'green',
      }),
    ],
  },
  {
    ...browser,
    target: 'webworker',
    mode: 'production',
    entry: path.resolve('src/web/worker.js'),
    output: {
      path: distWeb,
      filename: 'worker.js',
    },
    plugins: [
      new WebpackBar({
        name: 'worker',
        color: 'darkgreen',
      }),
    ],
  },
]

const compiler = webpack(config)

const isWatch = process.argv.includes('--watch')

// compiler.hooks.beforeRun.tap('delete on start', () => {
//   rimraf.sync(distWeb)
// })

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
