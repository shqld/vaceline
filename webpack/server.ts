import { DefinePlugin } from 'webpack'
import merge from 'webpack-merge'
import nodeExternals from 'webpack-node-externals'
import WebpackBar from 'webpackbar'
import { core } from './core'

const isDev = process.env.NODE_ENV === 'development'

export const server = merge(core, {
  target: 'node',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        oneOf: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
  externals: [nodeExternals({})],
  plugins: [
    new DefinePlugin({
      BUILD_PLATFORM: `'node'`,
    }),
    new WebpackBar({
      name: 'node',
      color: 'blue',
    }),
  ].filter(Boolean),
})
