const bcrypt = require('bcrypt-nodejs')

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const DB = require('./gw2DB')


//strategy gives you access to 'req.isAuthenticated()'
//passport automatically checks for "username" and "password"
//and runs authenticate function on them
passport.use(new LocalStrategy(authenticate))
passport.use('local-register',
    new LocalStrategy({passReqToCallback: true}, register))


//call done() with
// (system-error, false/user, {message: ''})
function authenticate(username, password, done) {
  //check that DB has same username-password pair
  DB('user_account_info')
    .where('username', username)
    .first()
    .then((user) => {
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return done(null, false, {message: 'incorrect user/password'})
      }

      done(null, user)
    })
    .catch((err) => {
      done(err)
    })
}

function register(req, username, password, done) {
  DB('user_account_info')
    .where('username', username)
    .first()
    .then((existingUser) => {
      if (existingUser) {
        return done(null, false, {message: 'someone already has that username'})
      }
      if (password !== req.body.password2) {
        return done(null, false, {message: 'passwords do not match'})
      }

      //if form filled correctly, add to DB
      let new_user = {
        username,
        password: bcrypt.hashSync(password),
        email: req.body.email,
        apikey: req.body.apikey
      }

      DB('user_account_info')
        .insert(new_user)
        .then(([id]) => {
          new_user.user_id = id
          done(null, new_user)
        })


    })
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
  done(null, user.user_id)
})

passport.deserializeUser((id, done) => {
  DB('user_account_info')
    .where('user_id', id)
    .first()
    .then((user) => {
      done(null, user)
    })
    .catch(done)
})
