
//ExpressServer_dev is the source, and gets babel-node built into ExpressServer for production



const bodyParser = require('body-parser')
const express = require('express')
const fs = require('fs')
const helmet = require('helmet')
const http = require('http')
const https = require('https')
const path = require('path')
import webpack from 'webpack'
// import webpackMiddleware from 'webpack-dev-middleware'
// import webpackHot from 'webpack-hot-middleware'
import webpackConfig from './webpack.dev.config.js'





//app is for controlling the server
let app = express()
let httpServer = http.createServer(app)

const privateKey = fs.readFileSync('C:/SSL/private.key')
const certificate = fs.readFileSync('C:/SSL/certificate.crt')
const credentials = {key: privateKey, cert: certificate}
let httpsServer = https.createServer(credentials, app)





///////////////////////////////////////////////
//  PLACE TO RUN SCRIPT ON SERVER START
///////////////////////////////////////////////





//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////










//http requests with content type application/json will be parsed
//req.body will be changed to a json object
app.use(bodyParser.json({limit: '50mb'}))
  .use(bodyParser.urlencoded({limit: '50mb', extended: true}))

// tells the browser to use https if they are on http
  .use(helmet())



  .set('view engine', 'hjs')


//router for gw2daata JSON responses
app.use('/gw2data', require('./server_routes/gw2data_route'))


if (process.env.NODE_ENV === 'development') {
  const webpackDevMiddleware = require('webpack-dev-middleware')(webpack(webpackConfig), {
    publicPath: webpackConfig.output.publicPath
  })

  app.use(webpackDevMiddleware)

  app.use(require('webpack-hot-middleware')(webpack(webpackConfig)));

  app.get('/gw2data/*', (req, res, next) => {
    const indexHTML = webpackDevMiddleware.fileSystem.readFileSync(
      require('path').join(webpackConfig.output.path, 'index.html'), 'utf-8')
    res.send(indexHTML)
  })
}


//Easy routing for requesting html and images, etc.
app.use(express.static('website_public'))


//if request reaches this, then physical file doesn't exist
app.get('/gw2data/*', (req, res, next) => {
  res.sendFile(path.resolve(__dirname,'./website_public/gw2data/index.html'))
})










//for that asshole that's just trying to POST over and over again
// app.post('/', (req, res, next) => {
//   console.log (`that asshole that keeps POSTing did it again... IP: ${req.ip}`)
//   res.status(403).send('fuck you')
// })





///////////////////////////////////
//    ERROR RESPONSES
///////////////////////////////////

  .use (function routeNotFound(req, res, next){
  let message = `Not Found:\nRequest from: ${req.ip}\nhttp info:\n`+
      `method: ${req.method}\nhost: ${req.hostname}\npath: ${req.path}\n`

  if (req.params) message += `params: ${JSON.stringify(req.params)}\n`
  if (req.query) message += `query: ${JSON.stringify(req.query)}\n`
  var err = new Error(message)

  err.status = 404;
  next(err)
})

  .use (function errorHandler(err, req, res, next){
  console.error (err);

  res.status(err.status || 500).send('Something went wrong!')
})



//
// function errorHandler(err, req, res, next){
//   console.error (err);
//   res.status(err.status || 500).send('Something went wrong!')
// }



//this starts the server
httpServer.listen(80, () => {
  console.log('http listening on port 80')
})

httpsServer.listen(443, () => {
  console.log('https listening on port 443')
})
