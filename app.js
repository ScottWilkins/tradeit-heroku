require('dotenv').config({silent: true});

var session = require('express-session')
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var authRoutes = require('./routes/auth');
var FBStrategy = require('passport-facebook').Strategy;

var routes = require('./routes/index');
var users = require('./routes/users');
var bids = require('./routes/bids');
var tenders = require('./routes/tenders');
var positions = require('./routes/positions');
var Users = require('./models/users')
var app = express();
var FbInfo = require('./models/fbInfo')
var userState = require('./models/userstate');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('mountincorsairs'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  keys: [process.env.SESSION_KEY1, process.env.SESSION_KEY2],
  secret: 'mountaincorsairs',
  resave: false,
  saveUninitialized: true
 }))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new FBStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.HOST + "/auth/facebook/FACEBOOK_CALLBACK_URL"
  },
  function(token, tokenSecret, profile, done) {
    FbInfo.facebook_id = profile.id;
    Users.findByFacebookId(profile.id).then(function(user){
      if(user.rows.length == 0){
        // app.use(function(err, req, res, next) {
          userState.status = "not_found";
          // res.send('not in database')
        // })
      }
    })
    // To keep the example simple, the user's fb profile is returned to
    // represent the logged-in user. In a typical application, you would want
    // to associate the fb account with a user record in your database,
    // and return that user instead (so perform a knex query here later.)
    done(null, profile)
  }
));

passport.serializeUser(function(user, done) {
 // later this will be where you selectively send to the browser an identifier for your user, like their primary key from the database, or their ID from linkedin
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  //here is where you will go to the database and get the user each time from it's id, after you set up your db
  done(null, user)
});

app.use(function (req, res, next) {
  res.locals.user = req.user
  next()
})

app.use('/', routes);
app.use('/', authRoutes);

////// if   userState.state == "not_found";

app.use('/users', users);
app.use('/tenders', tenders);
app.use('/bids', bids);
app.use('/positions', positions);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
