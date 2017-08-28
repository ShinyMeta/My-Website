
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
app.use(express.static('root'));

//router for /points/ requests
var points = require('./routes/points');
app.use('/points', points);

//router for goldFarm
app.use(session({
  store: new RedisStore(),
  secret: 'goldFarmSecretz',
  resave: false,
  saveUninitialized: false}))
var goldFarm = require('./routes/goldFarm');
app.use('/goldFarm', goldFarm);


app.use (function routeNotFound(req, res, next){
  var err = new Error(`Not Found:\nRequest from: ${req.ip}\n`+
      `Requesting from\nhost: ${req.hostname}\npath: ${req.path}`)

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
