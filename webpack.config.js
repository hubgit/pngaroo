const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WorkboxWebpackPlugin = require('workbox-webpack-plugin')

const title = 'Pngaroo' // EDIT THIS

module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  output: {
    filename: 'js/[name].[contenthash].js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  performance: {
    hints: false,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'static',
          // to: '[name].[hash].[ext]',
          // toType: 'template',
        },
      ]
    }),
    new HtmlWebpackPlugin({
      template: 'templates/index.html',
      title,
    }),
    new WorkboxWebpackPlugin.GenerateSW({
      swDest: 'service-worker.js',
    }),
  ],
  devServer: {
    contentBase: './dist',
  },
}
