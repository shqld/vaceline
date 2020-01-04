import merge from 'webpack-merge'

import { core } from './core'
import { DefinePlugin } from 'webpack'

export interface BrowserOptions {
  isModule: boolean
}

export const browser = merge(core, {
  target: 'web',
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
      BUILD_PLATFORM: `'browser'`,
    }),
  ],
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
