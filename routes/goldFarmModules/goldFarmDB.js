
'use strict';

var mysql = require('mysql');

var pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'mywebserver',
  database: 'goldfarmingdatabase'
});


let DB = {};
module.exports = DB;





//////////////////////////////////////////
//        QUERY WRAPPER FUNCTION
//////////////////////////////////////////

// basic wrapper function for a simple query
function query(queryString){
  return new Promise((resolve, reject) => {
    pool.getConnection(function(err, mysqlConnection){
      if (err){
        reject(err);
      }
      let query = mysqlConnection.query(queryString, function(err, result){
        //console.log(query.sql);
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









////////////////////////////////////////////////////
//     START AND END BUTTON SUPERFUNCTIONS
///////////////////////////////////////////////////



DB.getTimeResult = function (user) {

  let timeQueryString =
    'SELECT start.timestamp starttime, end.timestamp endtime FROM ' +
      'runstart start INNER JOIN runend end ' +
      'ON start.userid = end.userid ' +
      'WHERE start.userid = ' + user.id + ';';
  return query(timeQueryString)
    .then((result) => (result[0].endtime - result[0].starttime)/1000)
}

DB.getWalletResult = function (user) {
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

  return query(walletQueryString)
    .then( (result) => result.map(currencyQtyDiff) )
}

//combine the qtart and end qty of a currency into a single qty
function currencyQtyDiff({userid, name, currid, startqty, endqty}){
  let newCurrency = {
    userid,
    name,
    currid
  }
  if (startqty === null)     {newCurrency.qty = endqty}
  else if (endqty === null)  {newCurrency.qty = 0 - startqty}
  else                       {newCurrency.qty = endqty - startqty}

  return newCurrency;
}

DB.getItemsResult = function (user) {
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

  return query(itemsQueryString).then( (result) => result.map(itemQtyDiff) )
}

//combine the qtart and end qty of a currency into a single qty
function itemQtyDiff({userid, name, itemid, startqty, endqty}){
  let newItem = {
    userid,
    name,
    itemid
  }
  if (startqty === null)     {newItem.qty = endqty}
  else if (endqty === null)  {newItem.qty = 0 - startqty}
  else                       {newItem.qty = endqty - startqty}

  return newItem;
}


//wipes data out of the indicated start/ end state table
DB.resetStateTable = function (user, tableName){

  //recreate record in main table to reset timestamp(delete, then when done, insert)
  const mainDeleteQueryString = 'DELETE FROM ' + tableName + ' WHERE userid = ' + user.id;
  const mainInsertQueryString = 'INSERT INTO ' + tableName + ' (userid) VALUES ' + '('+user.id+')'
  //delete all records from wallet
  const walletDeleteQueryString = 'DELETE FROM ' + tableName + 'wallet WHERE userid = ' + user.id;
  //delete all records from items
  const itemsDeleteQueryString = 'DELETE FROM ' + tableName + 'items WHERE userid = ' + user.id;

  //when all done, resolve
  return Promise.all([
    query(mainDeleteQueryString).then((result) =>
      query(mainInsertQueryString)
    ),
    query(walletDeleteQueryString),
    query(itemsDeleteQueryString)
  ]);
}

//function to add currency to indicated start or end table
DB.addCurrencyToSaveState = function (userid, currid, qty, tableName){
  let queryString = 'INSERT INTO ' + tableName + ' (userid, currid, qty) VALUES ' +
                  '('+userid+', '+currid+', '+qty+')';
  return query(queryString);
}

//function to add item to indicated start or end table
DB.addItemToSaveState = function (userid, itemid, qty, tableName){
  let queryString = 'INSERT INTO ' + tableName + '(userid, itemid, qty) VALUES ' +
    '('+userid+', '+itemid+', '+qty+')';
  return query(queryString);
}







////////////////////////////////////////////////////
//        USER PROFILE LOAD FUNCTIONS
///////////////////////////////////////////////////

//search mySQL database for methods under username
DB.getMethods = function (username){
  //sql query for table with only methods with a userid that matches the username
  let  queryString = 'SELECT name FROM users INNER JOIN methods ON users.id = methods.userid ' +
    'WHERE users.username = "' + username + '"';

  return query(queryString)
}







////////////////////////////////////////////////////
//     ADD EDIT DELETE BUTTON SUPERFUNCTIONS
///////////////////////////////////////////////////


//does everything after requesting that a method be added to database
DB.addMethod = function (methodName, username){
  return DB.getUserAndMethod(methodName, username)
    .then(([user, method]) => {
      if (method) {
        throw new Error('Did not add method, method already exists')
      }
      else {
        let queryString = 'INSERT INTO methods (name, userid) VALUES ' +
          '("'+methodName+'", '+user.id+')';
        return query(queryString)
      }
    })
}

//does everything after requesting that a method be added to database
DB.deleteMethod = function (methodName, username){

  return DB.getUserAndMethod(methodName, username)
    .then(([user, method]) => {
      if(!method){
        throw new Error('Did not delete, method not found')
      }
      else {
        var queryString = 'DELETE FROM methods ' +
          'WHERE name = "' + methodName + '" AND userid = ' + user.id;
        return query(queryString)
      }
    })
}

//does everything after requesting that a method be added to database
DB.editMethod = function (methodName, newName, username){
  return DB.getUserAndMethod(methodName, username)
    .then(([user, method]) => {
      if(!method){
        throw new Error('Did not edit, method not found')
      }
      else {
        var queryString = 'UPDATE methods SET name = "' + newName +
          '" WHERE name = "' + methodName + '" AND userid = ' + user.id;
        return query(queryString)
      }
    })
}


////  ADD EDIT DELETE BUTTON HELPERS  ////
//////////////////////////////////////////

DB.getUser = function (username){
  var queryString = 'SELECT * FROM users WHERE username = "' + username + '"';
  return query(queryString)
    .then(confirmUniqueSelect)
}

DB.getMethod = function(methodName, userid){
  var queryString = 'SELECT * FROM methods ' +
    'WHERE name = "' + methodName + '" AND userid = ' + userid;
  return query(queryString)
    .then(confirmUniqueSelect)
}

//combination used by add, edit and delete method requests
DB.getUserAndMethod = function (methodName, username){
  let userPromise = DB.getUser(username)
  let methodPromise = userPromise.then((user) => DB.getMethod(methodName, user.id) )

  return Promise.all([userPromise, methodPromise])
}

//if a SELECT should only return one result, use this to extract form array,
//or throw error if you didn't get only 1 result
function confirmUniqueSelect(result){
  if (result.length === 1){      return Promise.resolve(result[0]); }
  else if (result.length === 0){ return Promise.resolve(); }
  else {                         throw new Error('more than one record with this condition') }
}
