/*
 * Provides all the logic for querying, manipulating and using redirect URLs
 */

module.exports.controller = function(app, models) {

  var express   = require('express');
  var util      = require('util');
  var router    = express.Router({mergeParams: true});
  var crypto    = require('crypto');
  var validator = require('validator');

  // Custom validators
  validator.extend('isMD5', function (str) {
        return /^[a-z0-9]{32}$/.test(str);
  });


  /*
   * List the top 50 latest URLs and the form to add a new URL entry.
   * TODO: Write proper pagination and search
   */
  app.get('/url', function(req, res, next) {

    function fetch_urls (fn) {
      models.Url.findAll({
        limit: 50,
        order: 'updatedAt DESC',
      })
      .then(function(Url_array) {
        fn(Url_array);
      })
    };

    fetch_urls(function(Url_array) {

      if (req.accepts('html')) {
        res.render('url', {"Url_array": Url_array});
      } else {
        res.status(200).json({
          "status": "success",
          "message": "TODO: Write this feature",
        })
      }

    });

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
          res.status(404).json({"status": "client_error", "message": "The requested URL does not exist"});
        } else {
          console.log('Match found, redirecting to: '+ Url.dataValues.url);

          // Perform an atomic increment of the counter
          Url.increment('count_clicks'); // by +1
          console.log('Click count now at: ' + Url.dataValues.count_clicks);


          // Report on the user agent. This is a little more complex, we need
          // to create an entry for each platform if it doens't already exist
          // and increment it by +1 if it does.

          console.log('Request made with platform: ' + req.useragent.platform);

          models.PlatformStats
          .findOrCreate({
            where: {
              // Check if a count already exists for this URL + Platform
              UrlId:    Url.dataValues.id,
              platform: req.useragent.platform,
            },
            defaults: {
              // Platform doesn't exist, create an entry with the following values:
              UrlId:        Url.dataValues.id,
              platform:     req.useragent.platform,
              count_clicks: 0,
            }})
          .spread(function(PlatformCount, created) {

            // Moar counter incrementz please!
            PlatformCount.increment('count_clicks'); // by +1

            if (created) {
              console.log('First time this platform has been seen, count set to 1');
            } else {
              console.log('Total clicks for this platform is: ' + PlatformCount.dataValues.count_clicks);
            }
          })
          .error(function(err){
            // This should never happen unless the DB is rather unhappy
            console.log('Warning: Unable to search/record the user\'s platform due to a DB error');
          });

          // Return redirect to user.
          res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
          res.header('Expires', '-1');
          res.header('Pragma', 'no-cache');

          res.redirect(301, Url.dataValues.url);
        }
      });

    } else {
      console.log("An invalid MD5sum was provided");
      res.status(404).json({"status": "client_error", "message": "Not a valid URL hash"});
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
        var redirect_url = app.get('base_url') + '/url/' + hashed_url

        console.log('Hashed version of URL "' + req.body.url + '" is "' + hashed_url + '"');


        models.Url.findOne({ where: {hash: hashed_url} }).then(function(Url) {
          if (Url) {
            console.log('Note, URL already exists. Just redirecting user to page');
          } else {
            // Create a DB entry
            models.Url.create({
              hash: hashed_url,
              url: req.body.url,
              count_clicks: 0
            })
            .error(function(err){
              // This should never happen unless the DB is rather unhappy
              console.log('An unexpected error occured when trying to create the URL');
              res.status(500).json({"status": "error", "message": "Unexpected server failure on URL save"});
            })
          }
        });

        // We are good to go! :-)
        if (req.accepts('html')) {
          res.status(200).render('url_created', {
            url_orig: req.body.url,
            url_redirect: redirect_url,
            url_stats: '/stats/' + hashed_url
          });
        } else {
          res.status(200).json({
            "status": "success",
            "message": "Click tracker created",
            "hash": hashed_url,
            "url_orig": req.body.url,
            "url_redirect": redirect_url,
            "url_stats": '/stats/' + hashed_url,
          });
        }

      } else {
        res.status(400).json({"status": "client_error", "message": "Client provided an invalid URL"});
      }
    } else {
      res.status(400).json({"status": "client_error", "message": "Client did not provide field URL"});
    }

  });

  /* DELETE a URL */
  app.delete('/url/:id', function(req, res) {

    // TODO - Auth here!!

    if (validator.isMD5(req.params.id)) {
      models.Url.findOne({ where: {hash: req.params.id} }).then(function(Url) {
        if (!Url) {
          res.status(404).send('{error: "client", message: "The requested URL does not exist"}');
        } else {
          console.log('Delete requested for URL: '+ req.params.id);

          Url.destroy().then(function() {
            console.log('Deleted!');
            res.send({"status": "success", "message": "Deletion completed"});
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
