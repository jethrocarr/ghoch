var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var app = express();

// Configuration
app.set('port', process.env.PORT || 3000);
app.set('base_url', process.env.BASE_URL || 'http://localhost:' + app.get('port') + '/');
app.set('db_database', process.env.DB_DATBASE || 'development');
app.set('db_host', process.env.DB_DATBASE || 'localhost');
app.set('db_username', process.env.DB_USERNAME || 'user');
app.set('db_password', process.env.DB_PASSWORD || 'password');
app.set('db_dialect', process.env.DB_DIALECT || 'sqlite');

// Setup Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Setup Express Framework
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Dynamically load Controllers (routes)
fs.readdirSync('./controllers').forEach(function (file) {
  if (file.substr(-3) == '.js') {
    route = require('./controllers/' + file);
    route.controller(app);
  }
});


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


// vi:smartindent:tabstop=2:shiftwidth=2:expandtab:
