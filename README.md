# ghoch

_ghoch (v) Klingon, track, track down_


## Warning

Ghoch is currently a real MVP-work-in-progress and so don't rely on this code
or anything about it to be stable, secure, bug free or even remotely sensible.


## About

Ghoch is a lightweight Node.js service which generates unique URLs which can be
used for click tracking. It's not specifically a URL shortener, since it
doesn't produce the world's shortest URLs, instead it generates URLs built
around a md5 hash of the original URL.

Ghoch provides the following features:
* Allows an authorised user to generate a unique URL (based on the md5sum of
  the original URL) which will redirect to it when requested.
* Counts the number of requests for a particular URL and allows an authorised
  user to retrive the count.
* SQL-backed.

Ghoch does not currently (but should longer term) provide:
* Authentication. Currently you need to run it inside your secure network and only expose the URLs with a layer 7 device/application like Nginx or Varnish which can provide the desired security.
* Any form of abuse-protection.
* Sophisication



## Usage

You can launch the app in a development mode with a simple:

    npm install
    npm start

All configuration is via environmentals, options are:

* PORT - defaults to "3000". Supports being set to a UNIX socket as well.
* WORKERS - Number of workers to run (using Node's cluster). Defaults to number of CPUs.
* BASE_URL - defaults to "localhost:PORT"
* DB_HOST - defaults to "localhost"
* DB_DATABASE - defaults to "development"
* DB_USERNAME - defaults to "user".
* DB_PASSWORD - defaults to "password"
* DB_DIALECT - defaults to "sqlite", but should work fine with with all Sequelise supported DBs including MySQL and Postgres.


## Production Recommendations

System requirements for this application are extremely low, a t2.micro can
deliver 100 req/second without breaking a sweat as long as the DB is performing
as expected.

Production should always be run against a "real" DB such as MySQL or PostgreSQL
rather than SQLite, which means the app is then stateless and you can easily
configure autoscaling on the application workers in event of a busy site.


Other things to check when running in production:

1. Read the security section below!
2. Set `NODE_ENV=production` to suppress the amount of public debug
   information.
3. You are monitoring the health check at /health for 200 responses.
4. You have configured an appropiate number of workers. The default is number
   of CPUs on the server, but you may wish to increase beyond that to counter
   any app bugs taking out a few workers in slow timeouts.


## Security

As there is no current security/authentication layer in this application, if
you decide to serve it publically it is *VITAL* that you block access to all
the application paths other than /url/HASH which needs to be public.

The following is an example of an Nginx configuration chunk that locks down the
application internally but allows the redirect URLs to be hit.


    location / {
      # Main application UI
      allow 192.168.0.0/24;
      deny all;
    
      proxy_pass http://trackerbackend;
    }
    
    location ~* "/url/[a-zA-Z0-9]{32}" {
      # We allow URL requests (/url/MD5SUM) from any location, but only as a GET
      # or HEAD request.
      allow all;
      
      # Block anything other than GET just to be sure that we don't get
      # any surprises.
      if ($request_method !~ ^(GET|HEAD)$ ) {
        return 403;
      }
      
      # Send request through to the backend.
      if (!-f $request_filename) {
        proxy_pass http://trackerbackend;
        break;
      }
    }

Alternatively, you could adjust `BASE_URL` in the application configuration to
use a different domain to internal, and only proxy pass that specific domain
through to Ghoch to process.



## API

A lightweight JSON API is included. You can force JSON response vs HTML
response with your applications by using the `Accept` header. Note that some
sections may return JSON regardless if they're not designed for end users to
access.

    $ curl -i -H "Accept: application/json" http://localhost:3000/
    {"json": "true"}
    
    $ curl -i -H "Accept: text/html" http://localhost:3000/
    <html>...


All JSON response will include `{"status": "success"` if processed OK and
should generally serve 200 OK, 404 if it's a request for a non-existent
URL or a 500 if something done goofed.

The following are the supported API calls:


    $ curl -i http://localhost:3000/health
    HTTP/1.1 200 OK
    {"status":"healthy"}
    
    $ curl -i http://localhost:3000/health
    HTTP/1.1 500 Internal Server Error
    {"status":"backend_failure","pid":8127,"hostname":"localhost"}

The health check returns either a 200 OK or 500 error if something is wrong. A
JSON message is provided for optional debugging help.


    $ curl -H "Accept: application/json" -X POST --data 'url=http://example.com' http://localhost:3000/url/
    {"status":"success",
     "message":"Click tracker created",
     "hash":"a9b9f04336ce0181a08e774e01113b31",
     "url_orig":"http://example.com",
     "url_redirect":"http://localhost:3000/url/a9b9f04336ce0181a08e774e01113b31",
     "url_stats":"/stats/a9b9f04336ce0181a08e774e01113b31"}

A new click tracker has been created. Note that if it already exists, this
success message is still returned and the record remains unmodified. The hash
along with the completed URLs are returned for easy integration into other
applications.


    $ curl -H "Accept: application/json" -X DELETE http://localhost:3000/url/d6a0d85d841f869347a3311bed0c9e06
    {"status":"success","message":"Deletion completed"}

Delete a URL. (Note: deletes are made with the `paranoid` option of Sequelize
enabled, so all deletes are hidden from the user rather than being permanently
stripped from the DB - allows for easy DBA recovery if someone deletes the
wrong records.




# License

ghoch is licensed under an MIT-style license:

    Copyright (c) 2015 Jethro Carr
    
    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
    of the Software, and to permit persons to whom the Software is furnished to do
    so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

