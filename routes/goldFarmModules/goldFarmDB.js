
'use strict';

// const mysql = require('mysql');

const DBIF = require('./goldFarmDBInterface')

let DB = {}
module.exports = DB




/////////////////////////////////////////////
//               USER  TABLE
/////////////////////////////////////////////

DB.addUser = function(user) {
  return DB.getUser(user)
    .then((user) => {
      if (user) {
        throw new Error('username already taken')
      }
    })
    .then (() => DBIF.insertQuery('users', user))
}


DB.getUser = function ({username, userid} = {}){
  let where = {}
  if (userid) where.id = userid
  else if (username) where.username = username
  else return Promise.reject(new Error('no username or userid specified'))

  return DBIF.selectQuery('users', {where})
    .then(confirmUniqueSelect)
}


/////////////////////////////////////////////
//              METHOD  TABLE
/////////////////////////////////////////////

DB.getMethod = function(where){
  return DBIF.selectQuery('methods', {where})
}

//does everything after requesting that a method be added to database
DB.addMethod = function (method){
  return DB.getMethod(method)
    .then(([result]) => {
      if (result) {
        throw new Error('addMethod Error: method already exists')
      }
      else {
        return DBIF.insertQuery('methods', method)
      }
    })
}

//does everything after requesting that a method be added to database
DB.deleteMethod = function (where){
  return DBIF.deleteQuery('methods', where)
    .then ((result) => {
      if (result.affectedRows === 0)
        throw new Error('deleteMethod: no records matched specification')
      return result
    })
}

//edits just a method's name in the methods table
DB.editMethod = function (method, newName){
  let {name, userid} = method

  let update = {name: newName}
  let where = {name, userid}

  return DBIF.updateQuery('methods', update, where)
}








////////////////////////////////////////////////////
//     START AND END BUTTON SUPERFUNCTIONS
///////////////////////////////////////////////////



DB.getTimeResult = function (user) {
  let timeQueryString =
    'SELECT start.timestamp starttime, end.timestamp endtime FROM ' +
      'runstart start INNER JOIN runend end ' +
      'ON start.userid = end.userid ' +
      'WHERE start.userid = ' + user.id + ';';
  return DBIF.query(timeQueryString)
    .then((result) => (result[0].endtime - result[0].starttime)/1000)
}

DB.getWalletResult = function (user) {
  let walletQueryString =
    'SELECT compare.userid, currencylookup.name, compare.currid, compare.startqty, compare.endqty FROM ' +
      '(SELECT end.userid, end.currid, start.qty startqty, end.qty endqty FROM ' +
        'runstartwallet start LEFT OUTER JOIN runendwallet end ' +
        'ON (start.currid = end.currid AND start.userid = end.userid)' +
        'WHERE start.userid = ' + user.id + ' AND start.qty != end.qty ' +
      'UNION ' +
      'SELECT end.userid, end.currid, start.qty startqty, end.qty endqty FROM ' +
        'runstartwallet start RIGHT OUTER JOIN runendwallet end ' +
        'ON (start.currid = end.currid AND start.userid = end.userid) ' +
        'WHERE end.userid = ' + user.id + ' AND start.currid IS NULL) compare ' +
    'INNER JOIN currencylookup ' +
    'ON compare.currid = currencylookup.id;';

  return DBIF.query(walletQueryString)
    .then( (result) => {
      return result.map(currencyQtyDiff)
    })
}

//combine the qtart and end qty of a currency into a single qty
function currencyQtyDiff({name, currid, startqty, endqty}){
  let newCurrency = {
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
        'ON (start.itemid = end.itemid AND start.userid = end.userid)' +
        'WHERE start.userid = ' + user.id + ' AND start.qty != end.qty ' +
      'UNION ' +
      'SELECT end.userid, end.itemid, start.qty startqty, end.qty endqty FROM ' +
        'runstartitems start RIGHT OUTER JOIN runenditems end ' +
        'ON (start.itemid = end.itemid AND start.userid = end.userid)' +
        'WHERE end.userid = ' + user.id + ' AND start.itemid IS NULL) compare ' +
    'INNER JOIN itemlookup ' +
    'ON compare.itemid = itemlookup.id;';

  return DBIF.query(itemsQueryString)
    .then( (result) => result.map(itemQtyDiff) )
}

//combine the start and end qty of a currency into a single qty
function itemQtyDiff({name, itemid, startqty, endqty}){
  let newItem = {
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

  let where = {userid: user.id}

  return Promise.all([
    DBIF.deleteQuery(tableName, where).then(() => {
      DBIF.insertQuery(tableName, where)}),
    DBIF.deleteQuery(tableName + 'wallet', where),
    DBIF.deleteQuery(tableName + 'items', where)
  ])

  // //recreate record in main table to reset timestamp(delete, then when done, insert)
  // const mainDeleteQueryString = 'DELETE FROM ' + tableName + ' WHERE userid = ' + user.id;
  // const mainInsertQueryString = 'INSERT INTO ' + tableName + ' (userid) VALUES ' + '('+user.id+')'
  // //delete all records from wallet
  // const walletDeleteQueryString = 'DELETE FROM ' + tableName + 'wallet WHERE userid = ' + user.id;
  // //delete all records from items
  // const itemsDeleteQueryString = 'DELETE FROM ' + tableName + 'items WHERE userid = ' + user.id;
  //
  // //when all done, resolve
  // return Promise.all([
  //   DBIF.query(mainDeleteQueryString).then((result) =>
  //     DBIF.query(mainInsertQueryString)
  //   ),
  //   DBIF.query(walletDeleteQueryString),
  //   DBIF.query(itemsDeleteQueryString)
  // ]);
}

//function to add currency to indicated start or end table
DB.addCurrencyToSaveState = function (userid, currid, qty, tableName){
  let curr = {userid, currid, qty}
  return DBIF.insertQuery(tableName, curr)

  // let queryString = 'INSERT INTO ' + tableName + ' (userid, currid, qty) VALUES ' +
  //                 '('+userid+', '+currid+', '+qty+')';
  // return DBIF.query(queryString);
}

//function to add item to indicated start or end table
DB.addItemToSaveState = function (userid, itemid, qty, tableName){
  let item = {userid, itemid, qty}
  return DBIF.insertQuery(tableName, item)

  // let queryString = 'INSERT INTO ' + tableName + '(userid, itemid, qty) VALUES ' +
  //   '('+userid+', '+itemid+', '+qty+')';
  // return DBIF.query(queryString);
}







////////////////////////////////////////////////////
//        USER PROFILE LOAD FUNCTIONS
///////////////////////////////////////////////////
//
// //search mySQL database for methods under username
// DB.getMethods = function (username){
//   //sql query for table with only methods with a userid that matches the username
//   let  queryString = 'SELECT name FROM users INNER JOIN methods ON users.id = methods.userid ' +
//     'WHERE users.username = "' + username + '"';
//
//   return DBIF.query(queryString)
// }




//combination used by add, edit and delete method requests
// DB.getUserAndMethod = function (methodName, username){
//   let userPromise = DB.getUser({username})
//   let methodPromise = userPromise.then((user) => DB.getMethod(methodName, user.id) )
//
//   return Promise.all([userPromise, methodPromise])
// }

//if a SELECT should only return one result, use this to extract form array,
//or throw error if you didn't get only 1 result
function confirmUniqueSelect(result){
  if (result.length === 1)      return result[0]
  else if (result.length === 0) return
  else                          throw new Error('more than one record with this condition')
}
