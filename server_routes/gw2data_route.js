
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
  .use(passport.session()) //stores the serialized user to session





  .get('/', (req, res, next) => {
    if (!req.user){
      res.redirect('/gw2data/login')
    }
    else{
      res.render('gw2data', {user: req.user})
    }
  })
  .get('/login', (req, res, next) => {
    res.render('login')
  })
  .post('/login', passport.authenticate('local', {
    successRedirect: '/gw2data',
    failureRedirect: '/gw2data/login'
  }))
  .get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
      res.redirect('/gw2data/login')
    })
  })
  .get('/signup', (req, res, next) => {
    res.render('signup')
  })
  .post('/signup', passport.authenticate('local-register', {
    successRedirect: '/gw2data',
    failureRedirect: '/gw2data/signup'
  }))






  .get('/gw2refUpdate', (req, res, next) => {
    res.render('gw2refUpdate')
  })
  .post('/gw2refUpdate', (req, res, next) => {
    // call the update function
    DB.updateRefTables()
      .then(() => {
        res.sendStatus(200)
      })
  })
