
'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport')
require('./goldFarmModules/passport')

//let https = require('https');
//let mysql = require('mysql');

const DB = require('./goldFarmModules/goldFarmDB');
const GW2API = require ('./goldFarmModules/goldFarmGW2API');




module.exports = router;







///////////////////////////////////////////
//           ROUTER FUNCTIONS
///////////////////////////////////////////

router
  .use(passport.initialize())
  .use(passport.session())

  .get('/', (req, res, next) => {
    if (!req.user){
      res.redirect('/goldFarm/login')
    }
    else{
      let user = req.user
      DB.getMethod({userid: user.id})
        .then((methods) => {
          res.render('GoldFarmCalc', {
            user,
            methods
          })
        })
    }
  })

  .get('/signup', (req, res, next) => {
    res.render ('signup')
  })
  .post('/signup', passport.authenticate('local-register', {
    successRedirect: '/goldFarm',
    failureRedirect: '/goldFarm/signup'
  }))

  .get('/login', (req, res, next) => {
    //check session for user info
    if (req.isAuthenticated())
      res.redirect ('/goldFarm')
    else
      res.render('login')
      //res.redirect ('/Pages/GoldFarmCalc/login.html')
  })
  .post('/login', passport.authenticate('local', {
    successRedirect: '/goldFarm',
    failureRedirect: '/goldFarm/login'
  }))

  .get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
      res.redirect('/goldfarm/login')
    })
  })




  // .get('/methods/:username', function (req, res, next) {
  //   //console.log('received request to methods');
  //   DB.getUser({username: req.params.username})
  //     .then((user) => DB.getMethod({userid: user.id}))
  //     .then((result) => {
  //       res.send(result)
  //     })
  //     .catch(next);
  // })

  //expected params: (username)
  .get('/startRun', function (req, res, next) {
    DB.resetStateTable(req.user, 'runstart')
      .then(() => saveStateTable(req.user, 'runstart'))
      .then((result) => { res.send() })
      .catch(next);
    // let user;
    // DB.getUser({username:req.user.username})
    //   .then((result) => user = result)
    //   .then(() => DB.resetStateTable(user, 'runstart') )
    //   .then(() => saveStateTable(user, 'runstart'))
    //   .then((result) => { res.send() })
    //   .catch(next);
  })

  //expected params: (username)
  .get('/endRun', function (req, res, next) {
    DB.resetStateTable(req.user, 'runend')
      .then(() => saveStateTable(req.user, 'runend') )
      .then(() => getRunResultsFromDB(req.user) )
      .then((result) => {
        res.send(result)
      })
      .catch(next);
  })

  .post('/newmethod', function (req, res, next) {
    //console.log(req.body);
    //add method/return false if method exists
    DB.addMethod({
          name: req.body.name,
          userid: req.user.id
        })
      .then((result) => {
        //console.log (result);
        res.send(result);
      })
      .catch(next);
  })

  .post('/deletemethod', function (req, res, next) {
    //console.log(req.body);
    //delete method/return false if method exists
    DB.deleteMethod({
        name: req.body.name,
        userid: req.user.id
      })
      .then((result) => {
        //console.log(result);
        res.send(result);
      })
      .catch(next);
  })

  .post('/editmethod', function (req, res, next) {
    //console.log(req.body);
    //delete method/return false if method exists

    let method = {
      name: req.body.name,
      userid: req.user.id
    }
    DB.editMethod(method, req.body.newName)
      .then((result) => {
        //console.log(result);
        res.send(result);
      })
      .catch(next);
  })






///////////////////////////////////////////
//       START/END SAVE FUNCTIONS
///////////////////////////////////////////

// THE super function. call this when you want to save the state
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
    //get wallet from api
    GW2API.getWallet(user, tableName)
      .then((wallet) => saveStateWallet(wallet, user, tableName + 'wallet'))
    ,
    //get items from function tht makes all item API calls
    getItemsFromAPI(user)
      .then((items) => saveStateItems(user, items, tableName + 'items'))
  ]);
}


//given an array of currencies(wallet), stores them in an indicated runtable
function saveStateWallet(wallet, user, tableName){
    let currencyAdds = [];
    for (let i = 0; i < wallet.length; i++){
      //get the currency ID, and qty and story it in the "run start/end items" table
      currencyAdds.push(DB.addCurrencyToSaveState(user.id, wallet[i].id, wallet[i].value, tableName));
    }
    return Promise.all(currencyAdds);
}


//gets all items from all item API calls, and returns a consolodated associated array
function getItemsFromAPI(user){
  return Promise.all([
    GW2API.getMats(user),
    GW2API.getBank(user),
    GW2API.getInventories(user),
    GW2API.getShared(user) ])
    .then((values) => {
      // THEN consolodate into associative array
      return values.reduce((newItems, items) =>
        consolodateItemsToNewArray(user, items, newItems) ,
        {})
    })
}

//move from items[] tp newItems{}(associative array) adding qty if item is already recorded
function consolodateItemsToNewArray(user, items, newItems){
  for (let i = 0; i < items.length; i++){
    if (items[i] !== null){
      ///////
      if (newItems[items[i].id]){
        newItems[items[i].id].qty += items[i].count;
      } else {
        newItems[items[i].id] = {userid: user.id, itemid: items[i].id, qty: items[i].count};
      }
      //////
    }
  }
  return newItems
}

//given an associative array of nicely trimmed items (all itemids unique) adds them to table
function saveStateItems(user, items, tableName){
  let itemAdds = [];
  for (let key in items){
    if (items.hasOwnProperty(key)){
      //get the item ID, and qty and add it to the "run start/end items" table
      itemAdds.push(DB.addItemToSaveState(user.id, items[key].itemid, items[key].qty, tableName));
    }
  }
  return Promise.all(itemAdds);
}





function getRunResultsFromDB(user){

  return Promise.all([
      DB.getTimeResult(user),
      DB.getWalletResult(user),
      DB.getItemsResult(user)
    ]).then((values) => {
      return{
        time: values[0],
        wallet: values[1],
        items: values[2]
      }
    })
}
