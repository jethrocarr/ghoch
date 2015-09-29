var express = require('express');
var os = require('os');
var router = express.Router();

module.exports.controller = function(app, models) {

  /* Health Check */
  app.get('/health', function(req, res, next) {

    // TODO: Need some smarts here to handle DB connection timeouts, but all
    // the stuff I've tried just drops the connection without a proper error
    // code being returned. Ideally should give a 500 response with reason.

    // We only really have one requirement - make sure the DB is working.
    models.sequelize.authenticate()
    .then(function(errors) {
      if (errors) {
        res.status(500).json({
          "status":   "failure",
          "hostname": os.hostname(),
          "pid":      process.pid,
          "message":  "Error returned from database query"
        });
      } else {
        res.status(200).json({"status": "healthy"});
      }
    });
  });

}

// vi:smartindent:tabstop=2:shiftwidth=2:expandtab:
