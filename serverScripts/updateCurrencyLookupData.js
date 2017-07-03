
var mysql = require('mysql');
var http = require('http');
var https = require('https');


//vars for database and Items API
var API_HOSTNAME = 'api.guildwars2.com';
var CURRENCIES_API_PATH = '/v2/currencies?page=0';


var requestQueue = [];
var MAX_EXECUTING_REQUESTS = 50;
var currentExecutingRequests = 0;

var currencies = [];


//MySQL connection
var mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mywebserver',
  database: 'goldfarmingdatabase'
});

mysqlConnection.connect();


//exporting the module
module.exports = updateCurrencyLookupData;



///////////////////////////////////////////
//          MAIN SCRIPT
///////////////////////////////////////////

//if running this file by itself, just call export function
updateCurrencyLookupData();

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////




//////////////////////////////////////////////////
//   GENERIC HTTP FUNCTIONS
//////////////////////////////////////////////////

//function makes appropriate http/https call based on queueable request object
function getRequest(queuedRequest){
  // var nextRequest = requestQueue[0];
  switch (queuedRequest.protocol){
    case 'http':  getHttpRequest(queuedRequest.hostname, queuedRequest.path, queuedRequest.responseFunction);  break;
    case 'https': getHttpsRequest(queuedRequest.hostname, queuedRequest.path, queuedRequest.responseFunction); break;
    default: break;
  }
}

//Generic 'GET' HTTP Request function
function getHttpRequest(hostname, path, responseFunction){
          //                console.log('Making http request to: ' + hostname + path);

  var options = {
    protocol: 'http:',
    hostname: hostname,
    path: path,
    method: 'GET'
  };

  var req = http.request(options, responseFunction).on('error', function(e) {
    console.log('problem: ' + e.message);
    if (e.code == "ECONNRESET"){
      //console.log("requeueing request");
      queueRequest('http', hostname, path, responseFunction);
      afterRequestComplete();
    }
  });

  req.end();

}

//Generic 'GET' HTTPS Request function
function getHttpsRequest(hostname, path, responseFunction){
            //              console.log('Making https request to: ' + hostname + path);

  var options = {
    protocol: 'https:',
    hostname: hostname,
    path: path,
    method: 'GET'
  };

  var req = https.request(options, responseFunction).on('error', function(e) {
    console.log('problem with request to ' + path + ': ' + e.message);
    if (e.code == "ECONNRESET"){
      //console.log("requeueing request");
      queueRequest('https', hostname, path, responseFunction);
      afterRequestComplete();
    }
  });

  req.end();
}

//generic parse data
function parseResponse(response, onData, onError, onEnd){
  //start a string to hold the data
  var dataString = '';
  response.on('data', function(data) {
    //when I receive a chunk of data in a response
    onData(data);
    dataString += data;
  }).on('error', function(error) {
    //in case of an error
    onError(error);
    console.error('Error ' + error);
  }).on('end', function(){
    //done receiving data and stuff
    onEnd(dataString);
  });
}




//class to store request data until called
function queueableRequest(protocol, hostname, path, responseFunction){
  this.protocol = protocol;
  this.hostname = hostname;
  this.path = path;
  this.responseFunction = responseFunction;
}

//function adds http request to queue
function queueRequest(protocol, hostname, path, responseFunction) {
  requestQueue.push(new queueableRequest(protocol, hostname, path, responseFunction));

  //if not currently executing max requests, then immediately execute it
  if (currentExecutingRequests < MAX_EXECUTING_REQUESTS){
    executeNextRequest();
  }
}

//function calls the first request in requests queue
function executeNextRequest(){
  //console.log('executing next request: ' + requestQueue[0].path);

  currentExecutingRequests++;
  //console.log('Beginning new Request. Currently active Requests: ' + currentExecutingRequests);
  getRequest(requestQueue.shift());
}


//function removes the first request from queue, and calls next one if any
//SHOULD ONLY BE CALLED AFTER THE NEXT REQUEST IS DONE
function afterRequestComplete(){
  currentExecutingRequests--;
  //console.log('Request Complete. Currently active Requests: ' + currentExecutingRequests);

  //if there's anything waiting, get it started
  if (requestQueue.length !== 0) {
    executeNextRequest();
  }
}


//



//////////////////////////////////////////////////
//   FUNCTIONS FOR DOWNLOADING ITEMS FROM API
//////////////////////////////////////////////////


//start by requesting the list of ids, then pass off to storing the ids and requesting them individually
function updateCurrencyLookupData(){
  queueRequest('https', API_HOSTNAME,  CURRENCIES_API_PATH, storeCurrencyData);

}



//response function for storing the items into an array
function storeCurrencyData(response) {
  //                    console.log('beginning to parse JSON');


  parseResponse(response,
    function(data){

  }, function(error){

  }, function(endData){
    afterRequestComplete();
    //done receiving data and stuff
    currencies = JSON.parse(endData);
    for (var i = 0; i < currencies.length; i++){
      var query = mysqlConnection.query('INSERT into currencylookup set ?', trimCurrencyForLookupTable(currencies[i]), logSQLError);
    }
  });

}




//////////////////////////////////////////
//    DATABASE HELPER FUNCTIONS
//////////////////////////////////////////

//returns an item with only attributes that can fit into itemlookup table
function trimCurrencyForLookupTable(currency) {
  var result = {
    id: currency.id,
    name: currency.name,
    icon: currency.icon
  };
  return result;
}

function logSQLError(err, result) {
  if (err && err.code != 'ER_DUP_ENTRY')
    console.log(err);
}
