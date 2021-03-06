const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WorkboxWebpackPlugin = require('workbox-webpack-plugin')

const title = 'Pngaroo'

const plugins = [
  new CleanWebpackPlugin({
    output: {
      path: 'dist',
    },
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: 'static',
        // to: '[name].[hash].[ext]',
        // toType: 'template',
      },
    ],
  }),
  new HtmlWebpackPlugin({
    template: 'templates/index.html',
    title,
  }),
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(new WorkboxWebpackPlugin.GenerateSW())
}

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
  plugins,
  devServer: {
    contentBase: './dist',
  },
}
