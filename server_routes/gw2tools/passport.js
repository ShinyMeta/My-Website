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
  return DB('user_account_info')
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
  return DB('user_account_info')
    .where('username', username)
    .orWhere('email', req.body.email)
    .first()
    .then((existingUser) => {
      if (existingUser && existingUser.username === username) {
        return done(null, false, {message: 'That username is already in use'})
      }
      if (existingUser && existingUser.email === req.body.email) {
        return done(null, false, {message: 'That email is already in use'})
      }

      //if form filled correctly, add to DB
      const new_user = {
        username,
        password: bcrypt.hashSync(password),
        email: req.body.email,
        apikey: req.body.apikey
      }

      return DB('user_account_info')
        .insert(new_user)
        .then(([id]) => {
          new_user.user_id = id
          req.user = new_user
          return done(null, new_user)
        })
        .catch(done)
    })
    .catch(done)
}




passport.serializeUser((user, done) => {
  done(null, user.user_id)
})

passport.deserializeUser((id, done) => {
  return DB('user_account_info')
    .where('user_id', id)
    .first()
    .then((user) => {
      done(null, user)
      return null
    })
    .catch(done)

})
