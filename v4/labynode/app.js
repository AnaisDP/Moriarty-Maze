var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

//appeler le modele
require('./models/users_model');
require('./models/game_model');
require('./models/scores_model');
var User = mongoose.model('User');

//connexion DB
mongoose.connect('mongodb://localhost/laby');

var routes = require('./routes/index');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret:'46546546abcdef',saveUninitialized:false,resave:false}));
app.use(express.static(path.join(__dirname, 'public')));

// faire appel à un middleware pour avoir l'user sous la main tout le temps
app.use(function(req,res,next){
	if(req.session && req.session.userId){
		User.findById(req.session.userId,function(err,user){
			if (err) return next(err);
			if (!user) req.session.destroy();
			else req.user = user; // on ne sauvegarde pas l'user dans une var de session, mais dans une var temporaire à la requete
			next();
		});
	} else next();
	
});
app.use('/', routes);
// normalement, la suite, pas besoin d'y toucher.
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
