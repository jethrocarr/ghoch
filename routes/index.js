var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ghoch', desc: 'A lightweight click tracking service' });
});

module.exports = router;
