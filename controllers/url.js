/*
 * Provides all the logic for querying, manipulating and using redirect URLs
 */

module.exports.controller = function(app) {

  var express   = require('express');
  var util      = require('util');
  var router    = express.Router({mergeParams: true});
  var crypto    = require('crypto');
  var validator = require('validator');
  var models    = require('../models')({app: app});

  // Custom validators
  validator.extend('isMD5', function (str) {
        return /^[a-z0-9]{32}$/.test(str);
  });


  /*
   * We don't list all URLs, instead we display a form that allows new URLs to be
   * requested.
   */
  app.get('/url', function(req, res, next) {
    res.render('url', {});
  });


  /* Follow a URL
   *
   * We check that the provided value is infact an md5 hash and then if so, we
   * look it up in the DB, increment the counter and return a 301 to the original
   * URL provided.
   *
   * If there is no match for the hash, we return 404.
   */
  app.get('/url/:id', function(req, res, next) {

    if (validator.isMD5(req.params.id)) {
     
      models.Url.findOne({ where: {hash: req.params.id} }).then(function(Url) {
        if (!Url) {
          res.status(404).send('{error: "client", message: "The requested URL does not exist"}');
        } else {
          console.log('Match found, redirecting to: '+ Url.dataValues.url);

          // Perform an atomic increment of the counter
          Url.increment('count_clicks'); // by +1
          console.log('Click count now at: ' + Url.dataValues.count_clicks);

          res.redirect(301, Url.dataValues.url);
        }
      });

    } else {
      console.log("An invalid MD5sum was provided");
      res.status(404).send('{error: "client", message: "Not a valid URL hash}');
    }

  });


  /* Generate a redirect for the supplied URL.
   *
   * We take the supplied URL by the user and generate a hashed md5
   * representation which is stored in the database. We then return the new
   * redirect URL to the user, so they can copy & paste to whatever system they
   * happen to be using.
   *
   */
  app.post('/url', function(req, res, next) {
    console.log('Generating new URL...');

    // TODO - Auth here!!

    if (req.body.url) {
      if (validator.isURL(req.body.url)) {
        /*
         * Valid URL supplied, let's create an MD5 version and return it to the user.
         */

        var hashed_url = crypto.createHash('md5').update(req.body.url).digest('hex');
        var redirect_url = process.env.BASE_URL + '/url/' + hashed_url

        console.log('Hashed version of URL "' + req.body.url + '" is "' + hashed_url + '"');


        // TODO - does this entry already exist?

        // Create a DB entry
        models.Url.create({
          hash: hashed_url,
          url: req.body.url,
          count_clicks: 0
        })
        .error(function(err){
          // This should never happen unless the DB is rather unhappy
          console.log('An unexpected error occured when trying to create the URL');
          res.status(500).send('{success: false, message: "Unexpected server failure on URL save"}');
        })


        // We are good to go! :-)
        if (req.accepts('html')) {
          res.status(200).render('url_created', {
            url_orig: req.body.url,
            url_redirect: redirect_url,
            url_stats: process.env.BASE_URL + '/stats/' + hashed_url
          });
        } else {
          res.status(200).json('{success: true}');
        }

      } else {
        res.status(400).send('{success: false, message: "Client provided an invalid URL"}');
      }
    } else {
      res.status(400).send('{success: false, message: "Client did not provide field URL"}');
    }

  });

  /* DELETE a URL */
  app.delete('/url/:id', function(req, res) {
    res.send("got a delete request for" + req.params.id);
  });

}

// vi:smartindent:tabstop=2:shiftwidth=2:expandtab: