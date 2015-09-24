/*
 * Displays the stats of a specific URL
 */

var express   = require('express');
var util      = require('util');
var router    = express.Router({mergeParams: true});
var validator = require('validator');
var crypto    = require('crypto');


/*
 * We don't list all URLs, instead we display a form that allows new URLs to be
 * requested.
 */
router.get('/', function(req, res, next) {
  res.render('url', {});
});


/* Follow a URL */
router.get('/:id', function(req, res, next) {
  res.send('respond with a resource' + req.params.id);
  console.log(util.inspect(req));
});

/*
 * Get the URL stats
 */
router.get('/:id/stats', function(req, res, next) {
  console.log('Pulling stats for ' + req.params.id + '...');

  // TODO - Auth here!!!
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
      console.log('Hashed version of URL "' + req.body.url + '" is "' + hashed_url + '"');

      // TODO - DB write here
      var redirect_url = process.env.BASE_URL + '/url/' + hashed_url

      res.render('url_created', {
        url_orig: req.body.url,
        url_redirect: redirect_url,
        url_stats: redirect_url + '/stats'
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
