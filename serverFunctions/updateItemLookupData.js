
var mysql = require('mysql');
var http = require('http');
var https = require('https');


//vars for database and Items API
var APIHOSTNAME = 'api.guildwars2.com';
var ITEMSAPIPATH = '/v2/items';
var IDParameters = '?ids=';

var IDS_PER_REQUEST = 200;

var requestQueue = [];
var MAX_EXECUTING_REQUESTS = 50;
var currentExecutingRequests = 0;

var items = [];


//MySQL connection
var mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mywebserver',
  database: 'goldfarmingdatabase'
});

mysqlConnection.connect();


//exporting the module
module.exports = updateItemLookupData;




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
      console.log("requeueing request");
      queueRequest('https', hostname, path, responseFunction);
      afterRequestComplete();
    }
  });

  req.end();
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
  console.log('Beginning new request. Currently active Requests: ' + currentExecutingRequests);
  getRequest(requestQueue.shift());
}


//function removes the first request from queue, and calls next one if any
//SHOULD ONLY BE CALLED AFTER THE NEXT REQUEST IS DONE
function afterRequestComplete(){
  currentExecutingRequests--;
  console.log('Request complete. Currently active Requests: ' + currentExecutingRequests);

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
function updateItemLookupData(){
  queueRequest('https', APIHOSTNAME, ITEMSAPIPATH, parseItemIds);

}

//function stores the items from first API call them stores it in an array
function parseItemIds(response){
                    // console.log(response.statusCode);
  // response.setEncoding('utf8');
  var dataString = '';
  response.on('data', function(data) {
    console.log('blah');
    dataString += data;
  }).on('error', function(error) {
                     console.error('Error ' + error);
  }).on('end', function(){
    afterRequestComplete();
                    // console.log('End.');
    var itemIds = JSON.parse(dataString);
    requestDetailsForItemIds(itemIds);
  });
}

//function makes an api request for an array of Ids
function requestDetailsForItemIds(itemIds){
  //first add all of the item ids to the ID parameters

  IDParameters += itemIds[0];
  for (var i = 0; i*IDS_PER_REQUEST < itemIds.length; i++){
    IDParameters = '?ids=' + itemIds[i*IDS_PER_REQUEST];

    //do a loop for a few ids, and make a request
    for (var j = 1; j < IDS_PER_REQUEST && (i*IDS_PER_REQUEST + j) < itemIds.length; j++){
      IDParameters += ',' + itemIds[i*IDS_PER_REQUEST + j];
    }
    //now request the small list of IDs
    queueRequest('https', APIHOSTNAME, ITEMSAPIPATH + IDParameters, storeItemData);
    //                      console.log(IDParameters);
  }

            console.log(itemIds.length);
}

//response function for storing the items into an array
function storeItemData(response) {
  //                    console.log('beginning to parse JSON');

  var dataString = '';
  response.on('data', function(data) {
    //when I receive a chunk of data in a response
    //console.log('blep');
    dataString += data;
  }).on('error', function(error) {
    console.error('Error ' + error);
  }).on('end', function(){
    afterRequestComplete();
    //done receiving data and stuff
    items = JSON.parse(dataString);
    for (var i = 0; i < items.length; i++){
      var query = mysqlConnection.query('INSERT into itemlookup set ?', trimItemForLookupTable(items[i]), logSQLError);
    }
  });

}




//////////////////////////////////////////
//    DATABASE HELPER FUNCTIONS
//////////////////////////////////////////

//returns an item with only attributes that can fit into itemlookup table
function trimItemForLookupTable(item) {
  var result = {
    id: item.id,
    chat_link: item.chat_link,
    name: item.name,
    icon: item.icon,
    type: item.type
  };
  return result;
}

function logSQLError(err, result) {
  if (err && err.code != 'ER_DUP_ENTRY')
    console.log(err);
}
