var express = require('express');
var router = express.Router();

module.exports.controller = function(app) {

  /* GET home page. */
  app.get('/', function(req, res, next) {
    res.render('index', { title: 'ghoch', desc: 'A lightweight click tracking service' });
  });

}

// vi:smartindent:tabstop=2:shiftwidth=2:expandtab:
