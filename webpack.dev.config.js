const webpack = require('webpack')
const baseConfig = require('./webpack.base.config.js')
// import webpack from 'webpack'
// import baseConfig from './webpack.base.config.js'

baseConfig.output.publicPath = '/gw2data'
baseConfig.devtool = 'inline-source-map'
baseConfig.plugins.push(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin()
)

let entry = baseConfig.entry.gw2data
baseConfig.entry.gw2data = [entry, 'webpack-hot-middleware/client']

module.exports = baseConfig
