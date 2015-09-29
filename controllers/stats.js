/*
 * Seporate route for viewing stats, mostly since it makes it easy to keep the
 * stats behind a restrictive layer 7 firewall.
 */

module.exports.controller = function(app, models) {

  var express   = require('express');
  var util      = require('util');
  var router    = express.Router({mergeParams: true});
  var crypto    = require('crypto');
  var validator = require('validator');
//  var models    = require('../models')({app: app});

  // Custom validators
  validator.extend('isMD5', function (str) {
        return /^[a-z0-9]{32}$/.test(str);
  });


  /*
   * Default stats page
   */
  app.get('/stats', function(req, res, next) {
    res.render('stats', {});
  });


  /* Lookup stats for a specific URL/hash.
   *
   * We check that the provided value is infact an md5 hash and then if so, we
   * look it up in the DB and return the stats.
   *
   * If there is no match for the hash, we return 404.
   */
  app.get('/stats/:id', function(req, res, next) {

    if (validator.isMD5(req.params.id)) {
     
      models.Url.findOne({ where: {hash: req.params.id} }).then(function(Url) {
        if (!Url) {
          res.status(404).send('{error: "client", message: "The requested URL does not exist"}');
        } else {
          console.log('Click count for '+ Url.dataValues.url +' requested, current count is: ' + Url.dataValues.count_clicks);

          // TODO - missing stats per URL here
          res.status(200).render('stats_per_url', {
            url_orig: Url.dataValues.url,
            count_total: Url.dataValues.count_clicks
          });
        }
      });

    } else {
      console.log("An invalid MD5sum was provided");
      res.status(404).json({"status": "client_error", "message": "Not a valid URL hash"});
    }

  });

}

// vi:smartindent:tabstop=2:shiftwidth=2:expandtab:
