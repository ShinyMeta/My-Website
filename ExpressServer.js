
//run server command:
//cd My Documents/Atom Projects/My Webpage/
//node ExpressServer.js

var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

//app is for controlling the server
var app = express();


///////////////////////////////////////////////
//  PLACE TO RUN SCRIPT ON SERVER START
///////////////////////////////////////////////

var API_KEY = 'access_token=58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';

var characterRequestURL = 'api.guildwars2.com/v2/characters?page=0&access_token=58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';
var walletRequestURL = 'api.guildwars2.com/v2/account/wallet?access_token=58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';
var bankRequestURL = 'api.guildwars2.com/v2/account/bank?access_token=58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';
var matStorageRequestURL = 'api.guildwars2.com/v2/account/materials?access_token=58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';

// var updateItemLookupData = require('./serverFunctions/updateItemLookupData.js');
// updateItemLookupData();

var updateCurrencyLookupData = require('./serverFunctions/updateCurrencyLookupData.js');
updateCurrencyLookupData();

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////










//http requests with content type application/json will be parsed
//req.body will be changed to a json object
app.use(bodyParser.json());

//Easy routing for requesting html and images, etc.
app.use(express.static('root'));

//router for /points/ requests
var points = require("./routes/points");
app.use("/points", points);

//router for goldFarm
var goldFarm = require('./routes/goldFarm');
app.use('/goldFarm', goldFarm);




//this starts the server
app.listen(80, function () {
  console.log('Example app listening on port 80!');
});
