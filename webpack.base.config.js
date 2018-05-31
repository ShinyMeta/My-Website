const webpack =require('webpack')
const HtmlWebpackPlugin =require('html-webpack-plugin')
// const LiveReloadPlugin =require('webpack-livereload-plugin')
// import webpack from 'webpack';
// import HtmlWebpackPlugin from 'html-webpack-plugin';
// import LiveReloadPlugin from 'webpack-livereload-plugin'
const path = require('path')

module.exports = {
  context: path.resolve(__dirname, 'website_src'),
  entry: {
    gw2data: './JS/gw2data.js'
  },
  output: {
    path: path.resolve(__dirname, 'website_public/gw2data'),
    filename: '[name].bundle.js',
    publicPath: '/gw2data/'
  },
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        use: ['style-loader', 'css-loader'],
        test: /\.css$/
      }
    ]
  },
  plugins: [
    //new LiveReloadPlugin(),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new HtmlWebpackPlugin({
      template: 'HTML/gw2data.html'
    })

  ],
  target: 'node',
  node: {
      __dirname: false,
  }
};
