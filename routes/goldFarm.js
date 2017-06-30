
'use strict';

var express = require('express');
var router = express.Router();

var https = require('https');
var mysql = require('mysql');




module.exports = router;

//module.exports = addMethod;



//var API_KEY = '58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';

var API_KEY_PARAM = 'access_token=';

const API_HOSTNAME = 'api.guildwars2.com';

const WALLET_PATH = '/v2/account/wallet';
const MAT_STORAGE_PATH = '/v2/account/materials';
const BANK_PATH = '/v2/account/bank';
const CHARACTERS_PATH = '/v2/characters?page=0';
const SHARED_PATH = '/v2/account/inventory';



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
    //console.log('received request to methods');
    getMethodsByUsername(req.params.username).then((result) => {
        //console.log(result);
        res.send(result);
    });
  })
  //expected params: (username)
  .get('/startRun', function (req, res) {
    ///console.log ('startRun');

    //first load user and method data from username
    getUser(req.query.username).then((user) => {
      //then remove records from that user data from both "run start" tables
      //create a single record in "run start" table (userid, methodid, timestamp)
      resetStateTable(user, 'runstart').then(() => {
        //request all items from API and store them in database
        saveStateTable(user, 'runstart').then((result) => {
          //each function has already added to the table, so we done, yo
          console.log('all done')
          res.send();
        })
      });
    })
    .catch((err) => {
      console.error(err);
    });
  })
  //expected params: (username)
  .get('/endRun', function (req, res) {
    //console.log ('endRun');

    //first load user and method data from username
    getUser(req.query.username).then((user) => {
      //then remove records from that user data from both "run start" tables
      //create a single record in "run start" table (userid, methodid, timestamp)
      resetStateTable(user, 'runend').then(() => {
        //request all items from API and store them in database
        saveStateTable(user, 'runend').then((result) => {
          //after table is updated, send response with all of the differences
          getRunResultsFromDB(user).then((result) => {
            res.send(result);
          });
        });
      });

    })
    .catch((err) => {
      console.error(err);
    });
  })
  .post('/newmethod', function (req, res) {
    //console.log(req.body);
    //add method/return false if method exists
    addMethod(req.body.name, req.body.username, function(result){
      //console.log (result);
      res.send(result);
    });
  })
  .post('/deletemethod', function (req, res) {
    //console.log(req.body);
    //delete method/return false if method exists
    deleteMethod(req.body.name, req.body.username, function(result){
      //console.log(result);
      res.send(result);
    });
  })
  .post('/editmethod', function (req, res) {
    //console.log(req.body);
    //delete method/return false if method exists
    editMethod(req.body.name, req.body.newName, req.body.username, function(result){
      //console.log(result);
      res.send(result);
    });
  })
;











///////////////////////////////////////////
//     HTTP/API CALL HELPER FUNCTIONS
///////////////////////////////////////////

//generic httpS requester for API calls
function getHttpsRequest(hostname, path){

  return new Promise((resolve, reject) => {
  //console.log('making request to ' + hostname + path);
    var options = {
      protocol: 'https:',
      hostname: hostname,
      path: path,
      method: 'GET'
    };
    var req = https.request(options, resolve).on('error', reject);
    req.end();
  });
}

//generic parse data
function parseResponse(response){
  return new Promise((resolve, reject) => {
    //start a string to hold the data
    var dataString = '';
    response.on('data', function(data) {
      //when I receive a chunk of data in a response
      dataString += data;
    }).on('error', function(error) {
      //in case of an error
      reject(error);
      console.error('Error ' + error);
    }).on('end', function(){
      //done receiving data and stuff
      //console.log('finished parsing response');
      resolve(dataString);
    })
  });
}

//////////////////////////////////////////
//////////////////////////////////////////








function saveStateTable(user, tableName){

  //saveStateTable DEPENDENCY TREE
  //  getWalletFromAPI - (getHttpsRequest)
  //  saveStateWallet
  //    addCurrencyToSaveState - (query)
  //  getItemsFromAPI
  //    getMatsFromAPI - (getHttpsRequest)
  //    getBankFromAPI - (getHttpsRequest)
  //    getInventoriesFromAPI - (getHttpsRequest)
  //    consolodateItemsToNewArray
  //  saveStateItems
  //    addItemToSaveState - (query)

  return Promise.all([
    new Promise((resolve, reject) => {
      //get wallet from api
      getWalletFromAPI(user, tableName).then((wallet) => {
        //  THEN query insert for every currency
        saveStateWallet(wallet, user, tableName + 'wallet').then((values) => {
        console.log('wallet done')
          resolve(values);
        })
      })
      .catch((err) => {
        console.error(err);
      })
    }),
    new Promise((resolve, reject) => {
      //get items from function tht makes all 3 API calls
      getItemsFromAPI(user).then((items) => {
        //  THEN query insert for every item
        saveStateItems(user, items, tableName + 'items').then((values) => {
        console.log('items done')
          resolve(values)
        })
      })
      .catch((err) => {
        console.error(err);
      })
    })
  ]);
}


//gets all currencies from user's wallet and stores them in the run start table
function getWalletFromAPI(user){
  return new Promise((resolve, reject) => {
    //make request to API for currencies
    var hostname = API_HOSTNAME;
    var path = WALLET_PATH + '?' + API_KEY_PARAM + user.apikey;
    getHttpsRequest(hostname, path).then((response) => {
      parseResponse(response).then ((endData) => {
        let wallet = JSON.parse(endData);
        resolve(wallet);
      })
      .catch((err) => {
        console.error(err);
      });
    })
    .catch((err) => {
      console.error(err);
    });
  })
}

//given an array of currencies(wallet), stores them in an indicated runtable
function saveStateWallet(wallet, user, tableName){
    let currencyAdds = [];
    for (var i = 0; i < wallet.length; i++){
      //get the currency ID, and qty and story it in the "run start/end items" table
      currencyAdds.push(addCurrencyToSaveState(user.id, wallet[i].id, wallet[i].value, tableName));
    }
    return Promise.all(currencyAdds);
}



//gets all items from all 4 API calls, and returns a consolodated associated array
function getItemsFromAPI(user){
  return new Promise ((resolve, reject) => {
    Promise.all([
      getMatsFromAPI(user),
      getBankFromAPI(user),
      getInventoriesFromAPI(user),
      getSharedFromAPI(user)
    ]).then((values) => {
      //  THEN consolodate into associative array
      let items = {};
      for (let i = 0; i < values.length; i++){
        //console.log(values[i])
        consolodateItemsToNewArray(user, values[i], items);
      }
      resolve(items);
    })
    .catch((err) => {
      console.error(err);
    });
  });
}



//gets all the materials from material storage of the user and tries to add adds them to items object
function getMatsFromAPI(user){
  return new Promise((resolve, reject) => {
    var hostname = API_HOSTNAME;
    var path = MAT_STORAGE_PATH + '?' + API_KEY_PARAM + user.apikey;
    getHttpsRequest(hostname, path).then((response) => {
      parseResponse(response).then ((endData) => {
        //store all mats into table
        let mats = JSON.parse(endData)
        resolve(mats);
      })
      .catch((err) => {
        console.error(err);
      });
    })
    .catch((err) => {
      console.error(err);
    });
  });
}

//gets all the materials from material storage of the user and adds them to items object
function getBankFromAPI(user){
  return new Promise((resolve, reject) => {
    var hostname = API_HOSTNAME;
    var path = BANK_PATH + '?' + API_KEY_PARAM + user.apikey;
    getHttpsRequest(hostname, path).then((response) => {
      parseResponse(response).then ((endData) => {
        //store all bank items into table
        let bankItems = JSON.parse(endData);
        resolve(bankItems);
      })
      .catch((err) => {
        console.error(err);
      });
    })
    .catch((err) => {
      console.error(err);
    });
  });
}

//gets all the materials from material storage of the user and adds them to items object
function getInventoriesFromAPI(user){

  return new Promise((resolve, reject) => {
    const hostname = API_HOSTNAME;
    const path = CHARACTERS_PATH + '&' + API_KEY_PARAM + user.apikey;
    getHttpsRequest(hostname, path).then((response) => {
      parseResponse(response).then ((endData) => {
        //array for holding all the items to return
        let inventoryItems = []
        //array of characters
        let characters = JSON.parse(endData);
        //loop through each character
        for (let i = 0; i < characters.length; i++){
          let bags = characters[i].bags;
          //loop through each bag on the character
          for (let j = 0; j < bags.length; j++){
            let inventory = bags[j].inventory;
            //loop through each item slot
            for (let k = 0; k < inventory.length; k++){
              //NOW WE GOT ITEMS YO
              if (inventory[k] !== null){
                inventoryItems.push(inventory[k]);
              }
            }
          }
        }
        resolve(inventoryItems);
      })
      .catch((err) => {
        console.error(err);
      });
    })
    .catch((err) => {
      console.error(err);
    });
  });
}

//gets the items in shared inventory slots from the API
function getSharedFromAPI(user){
  return new Promise((resolve, reject) => {
    var hostname = API_HOSTNAME;
    var path = SHARED_PATH + '?' + API_KEY_PARAM + user.apikey;
    getHttpsRequest(hostname, path).then((response) => {
      parseResponse(response).then ((endData) => {
        //store all bank items into table
        let sharedItems = JSON.parse(endData);
        resolve(sharedItems);
      })
      .catch((err) => {
        console.error(err);
      });
    })
    .catch((err) => {
      console.error(err);
    });
  });
}

//move from items[] tp newItems{}(associative array) while checking for previous entries
function consolodateItemsToNewArray(user, items, newItems){
  for (let i = 0; i < items.length; i++){
    //first check if item is NULL!
    if (items[i] !== null){
      //check if itemid hasn't been added yet
      if (newItems[items[i].id]){
        //if item already there, add the qty
        newItems[items[i].id].qty += items[i].count;
      } else {
        //if not, add to hashset
        newItems[items[i].id] = {userid: user.id, itemid: items[i].id, qty: items[i].count};
      }
    }
  }
}

//given an associative array of nicely trimmed items (all itemids unique) adds them to table
function saveStateItems(user, items, tableName){
  let itemAdds = [];
  for (var key in items){
    if (items.hasOwnProperty(key)){
      //get the item ID, and qty and add it to the "run start/end items" table
      itemAdds.push(addItemToSaveState(user.id, items[key].itemid, items[key].qty, tableName));
    }
  }
  console.log(itemAdds.length);
  return Promise.all(itemAdds);
}




//////// COMPARE TABLE FUNCTIONS /////////



function getRunResultsFromDB(user){
  //call 3 db queries to get start and end outerjoin on userid + itemid/currid where qtys are not equal?
  return new Promise((resolve, reject) => {
    //for the main table, compare the start and end times to get the total time elapsed

    Promise.all([
      getTimeResultFromDB(user),
      getWalletResultFromDB(user),
      getItemsResultFromDB(user)
    ]).then((values) => {
      resolve({
        time: values[0],
        wallet: values[1],
        items: values[2]
      })
    })
    .catch((err) => {
      console.error(err);
    })
  });
}

function getTimeResultFromDB(user) {
  return new Promise((resolve, result) => {
    let timeQueryString =
      'SELECT start.timestamp starttime, end.timestamp endtime FROM ' +
        'runstart start INNER JOIN runend end ' +
        'ON start.userid = end.userid ' +
        'WHERE start.userid = ' + user.id + ';';
    query(timeQueryString).then((result) => {
      //compare the starttime to end time
      let elapsedSeconds = (result[0].endtime - result[0].starttime)/1000;
      resolve(elapsedSeconds);
    })
    .catch((err) => {
      console.error(err);
    })
  })
}

function getWalletResultFromDB(user) {
  return new Promise((resolve, reject) => {
    let walletQueryString =
      'SELECT compare.userid, currencylookup.name, compare.currid, compare.startqty, compare.endqty FROM ' +
        '(SELECT end.userid, end.currid, start.qty startqty, end.qty endqty FROM ' +
          'runstartwallet start LEFT OUTER JOIN runendwallet end ' +
          'ON start.currid = end.currid ' +
          'WHERE start.userid = ' + user.id + ' AND start.qty != end.qty ' +
        'UNION ' +
        'SELECT end.userid, end.currid, start.qty startqty, end.qty endqty FROM ' +
          'runstartwallet start RIGHT OUTER JOIN runendwallet end ' +
          'ON start.currid = end.currid ' +
          'WHERE end.userid = ' + user.id + ' AND start.currid IS NULL) compare ' +
      'INNER JOIN currencylookup ' +
      'ON compare.currid = currencylookup.id;';
    query(walletQueryString).then((result) => {
      let walletResult = result.map((record) => {
        let newRecord = {
          userid: record.userid,
          name: record.name,
          currid: record.currid
        }
        if (record.startqty === null)     {newRecord.qty = record.endqty}
        else if (record.endqty === null)  {newRecord.qty = 0 - record.startqty}
        else                              {newRecord.qty = record.endqty - record.startqty}
        return newRecord;
      })
      resolve(walletResult);
    })
    .catch((err) => {
      console.error(err);
    })
  })
}

function getItemsResultFromDB(user) {
  return new Promise((resolve, reject) => {
    let itemsQueryString =
      'SELECT compare.userid, itemlookup.name, compare.itemid, compare.startqty, compare.endqty FROM ' +
        '(SELECT end.userid, end.itemid, start.qty startqty, end.qty endqty FROM ' +
          'runstartitems start LEFT OUTER JOIN runenditems end ' +
          'ON start.itemid = end.itemid ' +
          'WHERE start.userid = ' + user.id + ' AND start.qty != end.qty ' +
        'UNION ' +
        'SELECT end.userid, end.itemid, start.qty startqty, end.qty endqty FROM ' +
          'runstartitems start RIGHT OUTER JOIN runenditems end ' +
          'ON start.itemid = end.itemid ' +
          'WHERE end.userid = ' + user.id + ' AND start.itemid IS NULL) compare ' +
      'INNER JOIN itemlookup ' +
      'ON compare.itemid = itemlookup.id;';
    query(itemsQueryString).then((result) => {
      let itemsResult = result.map((record) => {
        let newRecord = {
          userid: record.userid,
          name: record.name,
          itemid: record.itemid
        }
        if (record.startqty === null)     {newRecord.qty = record.endqty}
        else if (record.endqty === null)  {newRecord.qty = 0 - record.startqty}
        else                              {newRecord.qty = record.endqty - record.startqty}
        return newRecord;
      })
      resolve(itemsResult);
    })
    .catch((err) => {
      console.error(err);
    })
  })
}










//////////////////////////////////////////
//       DATABASE HELPER FUNCTIONS
//////////////////////////////////////////

// basic wrapper function for a simple query
function query(queryString){
  return new Promise((resolve, reject) => {
    pool.getConnection(function(err, mysqlConnection){
      if (err){
        reject(err);
      }
      let query = mysqlConnection.query(queryString, function(err, result){
        // console.log(query.sql);
        mysqlConnection.release();

        if (err){
          reject(err);
        }
        resolve(result);
      });
    });
  });
}


/////////////////////////////////////////
/////////////////////////////////////////




//fully prepares the run state tables for the run
function resetStateTable(user, tableName){

  //recreate record in main table to reset timestamp(delete, then when done, insert)
  const mainDeleteQueryString = 'DELETE FROM ' + tableName + ' WHERE userid = ' + user.id;
  const mainInsertQueryString = 'INSERT INTO ' + tableName + ' (userid) VALUES ' + '('+user.id+')'
  //delete all records from wallet
  const walletDeleteQueryString = 'DELETE FROM ' + tableName + 'wallet WHERE userid = ' + user.id;
  //delete all records from items
  const itemsDeleteQueryString = 'DELETE FROM ' + tableName + 'items WHERE userid = ' + user.id;

  //when all done, resolve
  return Promise.all([
    new Promise ((resolve, reject) => {
      query(mainDeleteQueryString).then((result) => {})
      .then(() => {
        query(mainInsertQueryString).then( (result) => {resolve();} );
      })
    }),
    query(walletDeleteQueryString).then((result) => {}),
    query(itemsDeleteQueryString).then((result) => {})
  ]);
}

//function to add currency to run start/end
function addCurrencyToSaveState(userid, currid, qty, tableName){
  let queryString = 'INSERT INTO ' + tableName + ' (userid, currid, qty) VALUES ' +
                  '('+userid+', '+currid+', '+qty+')';
  return query(queryString);
}

//function to add item to run start/end
function addItemToSaveState(userid, itemid, qty, tableName){
  //if it's not there, insert the record
  let queryString = 'INSERT INTO ' + tableName + '(userid, itemid, qty) VALUES ' +
    '('+userid+', '+itemid+', '+qty+')';
  return query(queryString);
}


//search mySQL database for methods under username
function getMethodsByUsername(username){
  return new Promise((resolve, reject) => {
    //sql query for table with only methods with a userid that matches the username
    let  queryString = 'SELECT name FROM users INNER JOIN methods ON users.id = methods.userid ' +
      'WHERE users.username = "' + username + '"';


    query(queryString).then((result) => {resolve(result)})
    .catch((err) => { console.error(err) });
  })
}

//add method to methods table, return success status
function addMethod(methodName, username){
  return new Promise((resolve, reject) => {
    //first verify that username is correct
    getUser(username).then((user) => {
      //next check if method with same user and name exists, if so, return false (unsuccessful)
      checkMethodNameExists(methodName, user.id).then((methodExists) => {

        if(methodExists){
          resolve(false);
        }
        else {
          var queryString = 'INSERT INTO methods (name, userid) VALUES ' +
            '("' + methodName + '",' + user.id + ')';
          query(queryString).then((result) => {
            if (result){
              resolve(true);
            }
          })
        }
      })
      .catch((err) => { console.error(err) });
    })
    .catch((err) => { console.error(err) });
  });
}

//delete method return succes status
function deleteMethod(methodName, username){
  return new Promise((resolve, reject) => {
    //first verify that username is correct
    getUser(username).then((user) => {
      //next check if method with same user and name exists, if not, return false (unsuccessful)
      checkMethodNameExists(methodName, user.id).then((methodExists) => {

        if(!methodExists){
          resolve(false);
        }
        else {
          //here, we know method does exist, so we can delete safely
          var queryString = 'DELETE FROM methods WHERE name = "' + methodName + '" AND userid = ' + user.id;

          query(queryString).then((result) => {
            if (result){
              resolve(true);
            }
          })
          .catch((err) => { console.error(err) })
        }
      })
      .catch((err) => { console.error(err) });
    })
    .catch((err) => { console.error(err) });
  });
}

//edit method name return succes status
function editMethod(methodName, newName, username){
  return new Promise((resolve, reject) => {
    //first verify that username is correct
    getUser(username).then((user) => {
      //next check if method with same user and name exists, if not, return false (unsuccessful)
      checkMethodNameExists(methodName, user.id).then((methodExists) => {
        if(!methodExists){
          resolve(false);
        }
        else {
          //here, we know method does exist, so we can edit safely
          var queryString = 'UPDATE methods SET name = "' + newName +
            '" WHERE name = "' + methodName + '" AND userid = ' + user.id;

          query(queryString).then((result) => {
            if (result){
              resolve(true);
            }
          })
          .catch((err) => { console.error(err) })
        }
      })
      .catch((err) => { console.error(err) });
    })
    .catch((err) => { console.error(err) });
  });
}

//used for edit/delete requests, check to make sure method+userid is actually in the table
function checkMethodNameExists(methodName, userid){
  return new Promise((resolve, reject) => {
    //check if method with same user and name exists, if so, return false (unsuccessful)
    getMethod(methodName, userid).then((result) => {
      if (result.length === 0){
        //if no results, that means there is no method with same name for this userid
        resolve(false);
      }
      else {
        resolve(true);
      }
    })
    .catch((err) => { console.error(err) });
  });
}

function getUser(username){
  return new Promise((resolve, reject) => {
    var queryString = 'SELECT * FROM users WHERE username = "' + username + '"';
    query(queryString).then((result) => {
      if (result.length === 1){      resolve(result[0]); }
      else if (result.length === 0){ reject(new Error('no user matches the given username')); }
      else {                         reject(new Error('more than one user with this username'))}
    })
    .catch((err) => { console.error(err) });
  })
}

function getMethod(methodName, userid){
  var queryString = 'SELECT * FROM methods ' +
    'WHERE name = "' + methodName + '" AND userid = ' + userid;
  return query(queryString);
}
