import * as path from 'path'
import { DefinePlugin, Configuration } from 'webpack'

const isDev = process.env.NODE_ENV === 'development'

export const core: Configuration = {
  mode: isDev ? 'development' : 'production',
  entry: {
    // will be merged
  },
  output: {
    path: path.resolve('build'),
    filename: isDev ? '[name].js' : '[name].[contenthash].js',
    hashDigestLength: 8,
  },
  devtool: isDev ? 'eval-source-map' : false,
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      // will be merged
    ],
  },
  plugins: [
    new DefinePlugin({
      BUILD_ENV: `'${isDev ? 'development' : 'production'}'`,
    }),
  ],
  stats: 'normal',
} as Configuration
