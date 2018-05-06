const bcrypt = require('bcrypt-nodejs')
// const DBIF = require ('./goldFarmDBInterface.js')
// const GW2API = require ('./goldFarmGW2API.js')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

passport.use(new LocalStrategy(authenticate))
passport.use('local-register', new LocalStrategy({passReqToCallback: true}, register))

function authenticate(username, password, done) {
  // DBIF.selectQuery('users', {where:{username}})
  //   .then(([user]) => {
  //     if (!user || !bcrypt.compareSync(password, user.password)){
  //       return done(null, false, {message: 'invalid user/password combo'})
  //     }
  //     else {
  //       return done(null, user)
  //     }
  //   })
  //   .catch(done)
}

function register(req, username, password, done) {
  // DBIF.selectQuery('users', {where:{username}})
  // .then(([user]) => {
  //   if (user) {
  //     return done(null, false, {message: 'username already used'})
  //   }
  //   else if (password !== req.body.password2) {
  //     return done(null, false, {message: 'passwords do not match'})
  //   }
  //   else {
  //
  //     let newUser = {
  //       username: username,
  //       apikey: req.body.apikey,
  //       password: bcrypt.hashSync(password)
  //     }
  //
  //     //just gotta check if apikey is valid
  //     verifyapikey(newUser)
  //     .then((result) => {
  //       if (result.verified){
  //         DBIF.insertQuery('users', newUser)
  //         .then((result) => {
  //           newUser.id = result.insertId
  //           done(null, newUser)
  //         })
  //       }
  //       else {
  //         return done(null, false, {message: result.message})
  //       }
  //     })
  //   }
  // })
}

function verifyapikey(user) {
  return Promise.all([
    // GW2API.getWallet(user),
    // GW2API.getMats(user)
  ])
  .then((results) => {
    if (results[0].text) {
      return {
        verified: false,
        message: results[0].text
      }
    }
    else if (results[1].text) {
      return {
        verified: false,
        message: results[1].text
      }
    }
    else {
      return  {
        verified: true
      }
    }
  })
}


passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  // DBIF.selectQuery('users', {where:{id}})
  //   .then(([user]) => {
  //     done(null, user)
  //   })
  //   .catch(done)
})
