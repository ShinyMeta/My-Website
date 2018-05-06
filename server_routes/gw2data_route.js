
'use strict';

const express = require('express');
const router = express.Router();
// const passport = require('passport')
// require('./gw2dataModules/passport')

let GW2_REF = require('./gw2dataModules/GW2_Ref/GW2_Ref.js')


module.exports = router;







///////////////////////////////////////////
//           ROUTER FUNCTIONS
///////////////////////////////////////////

router
  // .use(passport.initialize())
  // .use(passport.session())

  .get('/', (req, res, next) => {
    // if (!req.user){
    //   res.redirect('/gw2data/login')
    // }
    // else{
    //   let user = req.user
    //   DB.getMethod({userid: user.id})
    //     .then((methods) => {
          res.render('gw2data'/*, {
            user,
            methods
          }*/)
    //     })
    // }
  })
  .get('/gw2refUpdate', (req, res, next) => {
    res.render('gw2refUpdate')
  })
  .post('/gw2refUpdate', (req, res, next) => {
    // call the update function
    GW2_REF.updateRefTables()
      .then(() => {
        res.sendStatus(200)
      })
  })
