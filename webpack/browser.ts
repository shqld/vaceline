import { DefinePlugin } from 'webpack'
import merge from 'webpack-merge'
import WebpackBar from 'webpackbar'

import { core } from './core'

// eslint-disable-next-line
const VisualizerPlugin = require('webpack-visualizer-plugin')

export interface BrowserOptions {
  isModule: boolean
}

export const browser = merge(core, {
  target: 'web',
  resolve: {
    extensions: ['.browser.ts'],
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      { test: /\.node\.ts$/, loader: 'ignore-loader' },
    ],
  },
  plugins: [
    new DefinePlugin({
      'BUILD_ENVS.BUILD_PLATFORM': `'browser'`,
    }),
    new VisualizerPlugin(),
    new WebpackBar({
      name: 'browser/module',
      color: 'green',
    }),
  ].filter(Boolean),
  node: {
    module: 'empty',
    dgram: 'empty',
    dns: 'mock',
    fs: 'empty',
    http2: 'empty',
    net: 'empty',
    tls: 'empty',
    // eslint-disable-next-line @typescript-eslint/camelcase
    child_process: 'empty',
  },
})
