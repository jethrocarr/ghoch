/*
 * Provides all the logic for querying, manipulating and using redirect URLs
 */

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
 * We don't list all URLs, instead we display a form that allows new URLs to be
 * requested.
 */
router.get('/', function(req, res, next) {
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
router.get('/:id', function(req, res, next) {

  if (validator.isMD5(req.params.id)) {
    // Check if it exists in the DB
    
    // Increment counter

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
router.post('/', function(req, res, next) {
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


      // TODO - DB write here      


      res.render('url_created', {
        url_orig: req.body.url,
        url_redirect: redirect_url,
        url_stats: process.env.BASE_URL + '/stats/' + hashed_url
      });

    } else {
      res.status(400).send('{error: "client", message: "Field url invalid}');
    }
  } else {
    res.status(400).send('{error: "client", message: "Field url must be provided}');
  }

});

/* DELETE a URL */
router.delete('/:id', function(req, res) {
  res.send("got a delete request for" + req.params.id);
});

module.exports = router;


// vi:smartindent:tabstop=2:shiftwidth=2:expandtab:
