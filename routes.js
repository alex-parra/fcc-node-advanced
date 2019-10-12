const passport = require('passport');
const bcrypt = require('bcrypt');


function ensureAuthenticated(req, res, next) {
  if( req.isAuthenticated() ) return next();
  res.redirect('/');
}


module.exports = function (app, db) {

  app.route('/')
    .get((req, res) => {
      const data = {title: 'Hello', message: 'Please login', showLogin: true, showRegistration: true};
      res.render(process.cwd() + '/views/pug/index.pug', data);
    });

  app.route('/login')
    .post( passport.authenticate('local', {failureRedirect: '/', successRedirect: '/profile'}) );
  
  app.route('/register')
    .post(
      (req, res, next) => {
        db.collection('users').findOne({ username: req.body.username }, (err, user) => {
          if( err ) {
            next(err);
          } else if( user ) {
            res.redirect('/');
          } else {
            const { username } = req.body;
            const password = bcrypt.hashSync(req.body.password, 12);
            db.collection('users').insertOne({username, password}, (err, newUser) => {
              next(null, newUser);
            });
          }
        });
      },
      passport.authenticate('local', {failureRedirect: '/', successRedirect: '/profile'})
    );
  
  app.route('/profile')
    .get(ensureAuthenticated, (req, res) => {
      res.render(process.cwd() + '/views/pug/profile.pug', {username: req.user.username});
    });
  
  app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });
  
  // Handle bad routes
  app.use((req, res, next) => {
    res.status(404).type('text').send('Not Found');
  });

}