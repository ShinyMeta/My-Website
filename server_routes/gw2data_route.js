
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
    // request data about those ids from DB
    DB.getItemDetails(ids)
      .then ((itemDetails) => {
        res.json(itemDetails)
      })
  })

  .get('/currentStep', (req, res, next) => {
    DB.getActiveRecordByUser(req.user.user_id)
      .then((record) => {
        console.log(record)
        if (!record) {
          res.json({currentStep: 0})
        }
        else if (record.status === 'running') {
          res.json({currentStep: 3, selectedCharacter: record.character_name,
            start_time: record.start_time})
        }
        else if (record.status === 'stopped') {
          res.json({currentStep: 4, selectedCharacter: record.character_name,
            start_time: record.start_time, end_time: record.end_time})
        }
        else if (record.status === 'editing') {
          DB.getStartEndDifferences(record.record_id)
            .then((differences) => {
              res.json({currentStep: 5, selectedCharacter: record.character_name,
                start_time: record.start_time, end_time: record.end_time,
                differences})
            })
        }
      })
      .catch((err) => {
        console.error(err)
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
      // if error during signup
      if (err) {
        console.error(err)
        return next(err)
      }
      //if user did not get created
      if (!user) {
        return res.status(401).send(info.message)
      }
      //if user registered, will return user:
      res.json(req.user)
    })(req, res, next)
  })

  // '/startRecord' body should have character(name, class, level) items and currencies
  .post('/startRecord', (req, res, next) => {
    let startState = req.body
    //check first if there is an active record
    DB.getActiveRecordByUser(req.user.user_id)
      .then((result) => {
        if (result) {
          res.status(403).send('The server received a request to start a new record for a user that has an active record.')
          return
        }
        else {
          startState.user_id = req.user.user_id
          DB.storeStartState(startState)
          res.status(200).send('Record is being created.')
        }
      })
  })

  // '/stopTimeRecord' body should have end_time only
  .post('/stopTimeRecord', (req, res, next) => {
    let end_time = req.body.end_time
    //check first if there is an active record
    DB.getActiveRecordByUser(req.user.user_id)
      .then((result) => {
        if ( !result || result.status != 'running') {
          res.status(403).send('There is no record for the authenticated user that is eligable to stop')
        }
        else {
          // console.log(`end_time: ${end_time} \n record id: ${result.record_id}`)
          DB.storeStopState(end_time, result)
          res.status(200).send('Record is stopped')
        }
      })
  })

  // '/endItemsRecord' body should have items, currencies and salvage settings
  .post('/endItemsRecord', (req, res, next) => {
    const endState = req.body
    //check first if there is an active record
    DB.getActiveRecordByUser(req.user.user_id)
      .then((record) => {
        if ( !record || record.status != 'stopped') {
          res.status(403).send('There is no record for the authenticated user that is stopped')
        }
        else {
          DB.storeEndState(endState, record)
            .then(() => {
              //get the records bu the recordid
              return DB.getStartEndDifferences(record.record_id)
            })
            .then((results) => {
              res.json(results)
            })
            .catch((err) => {
              console.error(err)
            })
        }
      })
  })



  .post('/gw2refUpdate', (req, res, next) => {
    // call the update function
    DB.updateRefTables()
      .then(() => {
        res.sendStatus(200)
      })
  })
