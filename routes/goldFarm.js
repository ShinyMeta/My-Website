
var express = require('express');
var router = express.Router();

var https = require('https');
var mysql = require('mysql');




module.exports = router;

//module.exports = addMethod;



var API_KEY = '58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';

var API_KEY_PARAM = 'access_token=';

var API_HOSTNAME = 'api.guildwars2.com';

var WALLET_PATH = '/v2/account/wallet';
var MAT_STORAGE_PATH = '/v2/account/materials';
var BANK_PATH = '/v2/account/bank';
var CHARACTERS_PATH = '/v2/characters?page=0';



var pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'mywebserver',
  database: 'goldfarmingdatabase'
});


///////////////////////////////////////////
//           ROUTER FUNCTIONS
///////////////////////////////////////////

router
  .get('/methods/:username', function (req, res) {
    console.log('received request to methods');
    var methods = getMethodsByUsername(req.params.username, function(result){
      console.log(result);

      res.send(result);
    });
  })
  //expected params: (username, methodName)
  .get('/startRun', function (req, res) {

    //first load user and method data from username
    getUser(req.query.username, function(user){
      getMethod(req.query.methodName, user.id, function(method){

        //then remove records from that user data from both "run start" tables
        //create a single record in "run start" table (userid, methodid, timestamp)
        resetRunTable(user, method, 'runStart', function(){

          //request wallet and store currencies in "run start items"
          getWallet(user, 'runstartitems');

          //request mat storage, bank and character inventories and add to "run start items"
          getItems(user, 'runstartitems');

          //each function has already added to the table, so we done, yo
          res.send();
        });
      });
    });
  })
  //expected params: (username)
  .get('/endRun', function (req, res) {

    //first load user and method data from username
    getUser(req.query.username, function(user){

      //then remove records from that user data from both "run start" tables
      //create a single record in "run start" table (userid, methodid, timestamp)
      resetRunEnd(user, function(result){

        //request wallet and store currencies in "run start items"
        getWallet(user, 'runenditems');

        //request mat storage, bank and character inventories and add to "run start items"
        getItems(user, 'runenditems');

        //each function has already added to the table, so we done, yo
        res.send();
      });

    });
  })
  .post('/newmethod', function (req, res) {
    //console.log(req.body);
    //add method/return false if method exists
    addMethod(req.body.name, req.body.username, function(result){
      console.log (result);
      res.send(result);
    });
  })
  .post('/deletemethod', function (req, res) {
    //console.log(req.body);
    //delete method/return false if method exists
    deleteMethod(req.body.name, req.body.username, function(result){
      console.log(result);
      res.send(result);
    });
  })
  .post('/editmethod', function (req, res) {
    //console.log(req.body);
    //delete method/return false if method exists
    editMethod(req.body.name, req.body.newName, req.body.username, function(result){
      console.log(result);
      res.send(result);
    });
  })
;


///////////////////////////////////////////
//     HTTP/API CALL HELPER FUNCTIONS
///////////////////////////////////////////

//generic httpS requester for API calls
function getHttpsRequest(hostname, path, responseFunction){
            //              console.log('Making https request to: ' + hostname + path);

  var options = {
    protocol: 'https:',
    hostname: hostname,
    path: path,
    method: 'GET'
  };

  console.log('making request to ' + hostname + path);

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

//////////////////////////////////////////
//////////////////////////////////////////

//fully prepares the runStart tables for run, performs callback on success value
function resetRunStart(user, method, callback){
  //remove records from that user data from tables
  //remove any records that match user.id from both tables
  var queryString = 'DELETE FROM runstart WHERE userid = ' + user.id;
  query(queryString, function(err){callback(false);}, function(result){

    queryString = "DELETE FROM runstartitems WHERE userid = " + user.id;
    query(queryString, function(err){callback(false);}, function(result){

      //create a single record in table (userid, methodid, timestamp)
      queryString = 'INSERT INTO runstart (userid, methodid) VALUES ' +
        '('+user.id+', '+method.id+')';
        query(queryString, function(err){callback(false);}, function(result){
          callback(true);
        });
    });
  });
}

//fully prepares the runEnd tables for run, performs callback on success value
function resetRunEnd(user, callback){
  //remove records from that user data from tables
  //remove any records that match user.id from both tables
  var queryString = 'DELETE FROM runend WHERE userid = ' + user.id;
  query(queryString, function(err){callback(false);}, function(result){

    queryString = "DELETE FROM runenditems WHERE userid = " + user.id;
    query(queryString, function(err){callback(false);}, function(result){

      //create a single record in table (userid, methodid, timestamp)
      queryString = 'INSERT INTO runend (userid) VALUES ' +
        '('+user.id+')';
        query(queryString, function(err){callback(false);}, function(result){
          callback(true);
        });
    });
  });
}


//gets all currencies from user's wallet and stores them in the run start table
function getWallet(user, tableName){
  //make request to API for currencies
  var hostname = API_HOSTNAME;
  var path = WALLET_PATH + '?' + API_KEY_PARAM + user.apikey;
  getHttpsRequest(hostname, path, function(response){

    parseResponse(response, function(data){}, function(error){},
      function(endData){
        wallet = JSON.parse(endData);
        for (var i = 0; i < wallet.length; i++){
          //get the currency ID, and qty and story it in the "run start items" table
          var queryString = "INSERT INTO " + tableName + " (userid, currid, qty) VALUES " +
          "("+user.id+", "+wallet[i].id+", "+wallet[i].value+")";
          query(queryString, function(err){}, function(result){});
        }
      });
  });
}


//gets all items from all 3 API calls, adds them to a local associated hashtable and upon commpletion
function getItems(user, tableName){
  var isDone = {mats: false, bank: false, inventories: false};
  var items = {};

  //call each of the 3 API functions here
  getMats(user, items, function(){
    isDone.mats = true;
    console.log('mats done');
    if (isDone.mats && isDone.bank && isDone.inventories){
      //finally store in database
      addItemsToTable(user.id, items, tableName, function(result){
        console.log(result + ' done');
      });
    }
  });

  getBank(user, items, function(){
    isDone.bank = true;
    console.log('bank done');
    if (isDone.mats && isDone.bank && isDone.inventories){
      //finally store in database
      addItemsToTable(user.id, items, tableName, function(result){
        console.log(result + ' done');
      });
    }
  });

  getInventories(user, items, function(){
    isDone.inventories = true;
    console.log('inventories done');
    if (isDone.mats && isDone.bank && isDone.inventories){
      //finally store in database
      addItemsToTable(user.id, items, tableName, function(result){
        console.log(result + ' done');
      });
    }
  });
}

//gets all the materials from material storage of the user and tries to add adds them to items object
function getMats(user, items, callback){
  var hostname = API_HOSTNAME;
  var path = MAT_STORAGE_PATH + '?' + API_KEY_PARAM + user.apikey;
  getHttpsRequest(hostname, path, function(response){
    parseResponse(response, function(data){}, function(err){},
      function(endData){
        //store all mats into table
        matStorage = JSON.parse(endData);
        for (var i = 0; i < matStorage.length; i++){
          //add item to table
          addItemToArray(user.id, matStorage[i].id, matStorage[i].count, items);
        }
        callback();
      });
  });
}

//gets all the materials from material storage of the user and adds them to items object
function getBank(user, items, callback){
  var hostname = API_HOSTNAME;
  var path = BANK_PATH + '?' + API_KEY_PARAM + user.apikey;
  getHttpsRequest(hostname, path, function(response){
    parseResponse(response, function(data){}, function(err){},
      function(endData){
        //store all bank items into table
        bankItems = JSON.parse(endData);
        for (var i = 0; i < bankItems.length; i++){
          //add item to table
          if (bankItems[i] !== null){
            addItemToArray(user.id, bankItems[i].id, bankItems[i].count, items);
          }
        }
        callback();
      });
  });
}

//gets all the materials from material storage of the user and adds them to items object
function getInventories(user, items, callback){
  var hostname = API_HOSTNAME;
  var path = CHARACTERS_PATH + '&' + API_KEY_PARAM + user.apikey;
  getHttpsRequest(hostname, path, function(response){
    parseResponse(response, function(data){}, function(err){},
      function(endData){
        //array of characters
        var characters = JSON.parse(endData);
        //loop through each character
        for (var i = 0; i < characters.length; i++){
          var bags = characters[i].bags;
          //loop through each bag on the character
          for (var j = 0; j < bags.length; j++){
            var inventory = bags[j].inventory;
            //loop through each item slot
            for (var k = 0; k < inventory.length; k++){
              //NOW WE GOT ITEMS YO
              if (inventory[k] !== null){
                addItemToArray(user.id, inventory[k].id, inventory[k].count, items);
              }
            }
          }
        }

  //{
  //   "bags": [
  //     {
  //       "id": 38013,
  //       "size": 20,
  //       "inventory": [
  //         {
  //           "id": 73718,
  //           "count": 1,
  //           "binding": "Account"
  //         },
  //         {
  //           "id": 19986,
  //           "count": 1,
  //           "charges": 21,
  //           "binding": "Account"
  //         },
  //         {
  //           "id": 79105,
  //           "count": 1,
  //           "charges": 2,
  //           "binding": "Account"
  //         },
  //         {
  //           "id": 19992,
  //           "count": 6,
  //           "binding": "Account"
  //         },
  //         {
  //           "id": 19699,
  //           "count": 7
  //         },
  //         {
  //           "id": 24628,
  //           "count": 1
  //         },
  //         null,
  //         null,
  //         null,
  //         null,
  //         null,
  //         null,
  //         null,
  //         null,
  //         null,
  //         null,
  //         null,
  //         null,
  //         null,
  //         null
  //       ]
  //     }
  //   ]
  // }

        callback();
      });
  });
}



//incorporate item into associated array, adding qty if already there
function addItemToArray(userid, itemid, qty, items){
  //check if itemid hasn't been added yet
  if (items[itemid]){
    //if item already there, add the qty
    items[itemid].qty += qty;
  } else {
    //if not, add to hashset
    items[itemid] = {userid: userid, itemid: itemid, qty: qty};
  }
}


//////////////////////////////////////////
//       DATABASE HELPER FUNCTIONS
//////////////////////////////////////////

// basic wrapper function for a simple query
function query(queryString, errorFunction, resultFunction){
  pool.getConnection(function(err, mysqlConnection){
    if (err){
      console.error(err);
      return;
    }
    var query = mysqlConnection.query(queryString, function(err, result){
      // console.log(query.sql);
      mysqlConnection.release();

      if (err){
        console.error(err);
        errorFunction(err);
        return;
      }
      resultFunction(result);
    });
  });
}

/////////////////////////////////////////
/////////////////////////////////////////


//adds all of the items in an array to the database
function addItemsToTable(userid, items, tableName, callback){
  //have to iterate through items,
  for (var key in items){
    if (items.hasOwnProperty(key)){
      //then we need to add this item to the table
      addItemToTable(userid, items[key].itemid, items[key].qty, tableName, function(result){});
    }
  }
  callback();
}


//function to add item to run start/end, adding qty if item is already in table
function addItemToTable(userid, itemid, qty, tableName, callback){

  if (itemid === 77886) console.log ('addig item 77886');

  //check for itemid in the table
  var queryString = 'SELECT * FROM ' + tableName + ' WHERE itemid = ' + itemid +
    ' AND userid = ' + userid;
  query(queryString, function(err){}, function(result){

    //if it's not there, insert the record
    if (result.length === 0){
      queryString = 'INSERT INTO ' + tableName + '(userid, itemid, qty) VALUES ' +
        '('+userid+', '+itemid+', '+qty+')';

        if (itemid === 77886) console.log(queryString);

      query(queryString, function(err){}, function(result){
        callback(result);
      });
    }
    else if (result.length === 1){
      //if it is, update the record
      var newQty = result[0].qty + qty;
      queryString = 'UPDATE ' + tableName + ' SET qty = ' + newQty +
        ' WHERE itemid = ' + itemid + ' AND userid = ' + userid;

      if (itemid === 77886) console.log(queryString);

      query(queryString, function(err){}, function(result){
        callback(result);
      });
    }
    else {
      console.log ('error, there is more than one record with this item and user id');
    }

  });
}

//search mySQL database for methods under username
function getMethodsByUsername(username, callback){
  //sql query for table with only methods with a userid that matches the username
  var queryString = 'SELECT name FROM users INNER JOIN methods ON users.id = methods.userid ' +
    'WHERE users.username = "' + username + '"';

  query(queryString, function(err){}, callback);
}

//add method to methods table, return success status
function addMethod(methodName, username, callback){

  //first verify that username is correct
  getUser(username, function(user){
    //next check if method with same user and name exists, if so, return false (unsuccessful)
    checkMethodNameExists(methodName, user.id, function(methodExists){

      if(methodExists){
        callback(false);
      }
      else {
        var queryString = 'INSERT INTO methods (name, userid) VALUES ' +
          '("' + methodName + '",' + user.id + ')';
        query(queryString,
          function(err){
            if (err) callback(false);
        }, function(result){
          if (result){
            callback(true);
          }
        });
      }
    });
  });

}

//delete method return succes status
function deleteMethod(methodName, username, callback){
  //first verify that username is correct
  getUser(username, function(user){
    //next check if method with same user and name exists, if not, return false (unsuccessful)
    checkMethodNameExists(methodName, user.id, function(methodExists){

      if(!methodExists){
        callback(false);
      }
      else {
        //here, we know method does exist, so we can delete safely
        var queryString = 'DELETE FROM methods WHERE name = "' + methodName + '" AND userid = ' + user.id;

        query(queryString,
          function(err){
          if (err) callback(false);
        }, function(result){
          if (result){
            callback(true);
          }
        });
      }
    });
  });

}

//edit method name return succes status
function editMethod(methodName, newName, username, callback){
  //first verify that username is correct
  getUser(username, function(user){
    console.log (user);
    //next check if method with same user and name exists, if not, return false (unsuccessful)
    checkMethodNameExists(methodName, user.id, function(methodExists){

      if(!methodExists){
        callback(false);
      }
      else {
        //here, we know method does exist, so we can edit safely
        var queryString = 'UPDATE methods SET name = "' + newName +
          '" WHERE name = "' + methodName + '" AND userid = ' + user.id;

        query(queryString,
          function(err){
          if (err) callback(false);
        }, function(result){
          if (result){
            callback(true);
          }
        });
      }
    });
  });

}

//used for edit/delete requests, check to make sure method+userid is actually in the table
function checkMethodNameExists(name, userid, callback){
  //check if method with same user and name exists, if so, return false (unsuccessful)
  var queryString = 'SELECT id FROM methods ' +
    'WHERE name = "' + name + '" AND userid = ' + userid;

  query(queryString, function(err){}, function(result){
    if (result.length === 0){
      //if no results, that means there is no method with same name for this userid
      callback(false);
    }
    else {
      callback(true);
    }
  });
}

function getUser(username, callback){

  var queryString = "SELECT * FROM users WHERE username = '" + username + "'";

  query(queryString, function(err){},  function(result){
    if (result.length === 1){
      callback(result[0]);
    }
    else {
      callback(null);
    }
  });
}

function getMethod(methodName, userid, callback){

  var queryString = 'SELECT * FROM methods ' +
    'WHERE name = "' + methodName + '" AND userid = ' + userid;

  query(queryString, function(err){},  function(result){
    if (result.length === 1){
      callback(result[0]);
    }
    else {
      callback(null);
    }
  });
}
