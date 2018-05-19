
'use strict';

const express = require('express');
const router = express.Router();
const session = require('express-session')
const passport = require('passport')
    require('./gw2tools/passport.js')
const RedisStore = require('connect-redis')(session)

let DB = require('./gw2tools/gw2DB.js')


module.exports = router;







///////////////////////////////////////////
//           ROUTER FUNCTIONS
///////////////////////////////////////////

router
  //session setup for maintained logins
  //this adds req.session to the incoming req object
  //anything that I add to the session object will be remembered until deleted
  .use(session({
    store: new RedisStore(), //this will store those sessions in redis database
    secret: 'goldFarmSecretz',
    resave: false,
    saveUninitialized: false}))
  .use(passport.initialize()) //will look for user on req
  .use(passport.session()) //stores the serialized user to session (req.user)



  //used to check if user is logged in
  .get('/user', (req, res, next) => {
    if (req.user) res.json(req.user)
    else res.json(null)
  })

  .get('/itemDetails', (req, res, next) => {
    const ids = req.query.ids.split(',').map(x => parseInt(x))
    console.log(ids)
    // request data about those ids from DB
    DB.getItemDetails(ids)
      .then ((itemDetails) => {
        console.log(itemDetails)
        res.json(itemDetails)
      })
  })




  .post('/login', passport.authenticate('local'), (req, res) => {
    //if autehenticated, will return user:
    res.json(req.user)
  })
  .post('/logout', (req, res, next) => {
    if (req.user){
      req.session.destroy((err) => {
        if (err) return next(err)
        res.sendStatus(200)
      })
    } else {
      res.sendStatus(200)
    }
  })
  .post('/signup', (req, res, next) => {
    passport.authenticate('local-register', (err, user, info) => {
      // if error during authentication
      if (err) {
        console.error(err)
        return next(err)
      }
      //if user did not authenticate
      if (!user) {
        return res.status(401).send(info.message)
      }
      //if autehenticated, will return user:
      res.json(req.user)
    })(req, res, next)
  })



  .post('/gw2refUpdate', (req, res, next) => {
    // call the update function
    DB.updateRefTables()
      .then(() => {
        res.sendStatus(200)
      })
  })
