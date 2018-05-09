


const fs = require('fs')
const http = require('http')
const https = require('https')
const express = require('express')

const bodyParser = require('body-parser')
const helmet = require('helmet')


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
app.use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: false}))

// tells the browser to use https if they are on http
app.use(helmet())

//Easy routing for requesting html and images, etc.
app.set('view engine', 'hjs')
  .use(express.static('webpage_src'))


//redirect non-https traffic to secure connection
app.use(function(req, res, next) {
  if(!req.secure) {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  next();
});


//router for gw2data
app.use('/gw2data', require('./server_routes/gw2data_route'))













//for that asshole that's just trying to POST over and over again
// app.post('/', (req, res, next) => {
//   console.log (`that asshole that keeps POSTing did it again... IP: ${req.ip}`)
//   res.status(403).send('fuck you')
// })





///////////////////////////////////
//    ERROR RESPONSES
///////////////////////////////////

app.use (function routeNotFound(req, res, next){
  let message = `Not Found:\nRequest from: ${req.ip}\nhttp info:\n`+
      `method: ${req.method}\nhost: ${req.hostname}\npath: ${req.path}\n`

  if (req.params) message += `params: ${JSON.stringify(req.params)}\n`
  if (req.query) message += `query: ${JSON.stringify(req.query)}\n`
  var err = new Error(message)

  err.status = 404;
  next(err)
})

app.use (function errorHandler(err, req, res, next){
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
