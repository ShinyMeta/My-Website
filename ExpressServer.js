
//run server command:
//cd My Documents/Atom Projects/My Webpage/
//node ExpressServer.js

var bodyParser = require('body-parser');
var express = require('express');
const session = require('express-session')
const RedisStore = require('connect-redis')(session)

//app is for controlling the server
var app = express();


///////////////////////////////////////////////
//  PLACE TO RUN SCRIPT ON SERVER START
///////////////////////////////////////////////



// var updateItemLookupData = require('./serverFunctions/updateItemLookupData.js');
// updateItemLookupData();

//var updateCurrencyLookupData = require('./serverFunctions/updateCurrencyLookupData.js');
//updateCurrencyLookupData();

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////










//http requests with content type application/json will be parsed
//req.body will be changed to a json object
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

//Easy routing for requesting html and images, etc.
app.set('view engine', 'hjs')
app.use(express.static('webpage_src'));


//router for gw2data
app.use(session({
  store: new RedisStore(),
  secret: 'goldFarmSecretz',
  resave: false,
  saveUninitialized: false}))
app.use('/gw2data', require('./server_routes/gw2data_route'));













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
app.listen(80, function () {
  console.log('Example app listening on port 80!');
});
