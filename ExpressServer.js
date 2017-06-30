
//run server command:
//cd My Documents/Atom Projects/My Webpage/
//node ExpressServer.js

var express = require('express');
var bodyParser = require('body-parser');
//var fs = require('fs');

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

//Easy routing for requesting html and images, etc.
app.use(express.static('root'));

//router for /points/ requests
var points = require('./routes/points');
app.use('/points', points);

//router for goldFarm
var goldFarm = require('./routes/goldFarm');
app.use('/goldFarm', goldFarm);




//this starts the server
app.listen(80, function () {
  console.log('Example app listening on port 80!');
});
