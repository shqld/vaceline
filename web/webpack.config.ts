import path from 'path'
import webpack from 'webpack'
import { browser } from '../webpack'
import WebpackBar from 'webpackbar'

// eslint-disable-next-line
const VisualizerPlugin = require('webpack-visualizer-plugin')

const paths = {
  web: path.join(__dirname),
  get src() {
    return path.join(this.web, 'src')
  },
  get dist() {
    return path.join(this.web, 'dist')
  },
}

const isDev = process.argv.includes('--dev')

const config: Array<webpack.Configuration> = [
  {
    ...browser,
    mode: isDev ? 'development' : 'production',
    entry: path.join(paths.src, 'browser/index.ts'),
    output: {
      path: paths.dist,
      filename: 'main.js',
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
    mode: isDev ? 'development' : 'production',
    entry: path.join(paths.src, 'worker.ts'),
    output: {
      path: paths.dist,
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

export default config
