const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    index: [path.resolve(__dirname, 'example/index.ts')],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.wasm'],
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new webpack.ProvidePlugin({
      TextDecoder: ['text-encoding', 'TextDecoder'],
      TextEncoder: ['text-encoding', 'TextEncoder'],
    }),
  ],
  mode: 'development',
  node: {
    fs: 'empty',
  },
};
