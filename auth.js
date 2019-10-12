const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local');
const ObjectID = require('mongodb').ObjectID;

module.exports = function (app, db) {

  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy((username, password, done) => {
    db.collection('users').findOne({ username: username }, (err, user) => {
      console.log('User '+ username +' attempted to log in.');
      if( err ) return done(err);
      if( !user || bcrypt.compareSync(password, user.password) !== true ) return done(null, false);
      return done(null, user);
    });
  }));
  
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    db.collection('users').findOne({_id: new ObjectID(id)}, (err, doc) => done(null, doc));
  });


}