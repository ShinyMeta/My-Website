const webpack = require('webpack')
const baseConfig = require('./webpack.base.config.js')
// import webpack from 'webpack'
// import baseConfig from './webpack.base.config.js'

baseConfig.devtool = 'source-map'


module.exports = baseConfig
