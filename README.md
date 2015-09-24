# ghoch

''ghoch (v) Klingon, track, track down''


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

* PORT - defaults to "3000"
* BASE_URL - defaults to "localhost:PORT"
* DB_DATABASE - defaults to "development"
* DB_USERNAME - defaults to "user".
* DB_PASSWORD - defaults to "password"
* DB_DIALECT - defaults to "sqlite", but should work fine with with all Sequelise supported DBs including MySQL and Postgres.




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

