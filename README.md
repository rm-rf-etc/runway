Runway.js
==========

Stupidly simple, performance-oriented router module for node.js apps.

`npm install runway`

version: 0.0.23-beta

### Intro...

Runway is currently in beta. Please consider contributing or staring this repo on npm
if you like what has been done so far.

Tryout `node examples/basic.js` and then browse to `localhost:8080/`.
Try running `node test/test.js` to see routes working and with working route filters.  
Try running `node test/perf.js` to run the performance tests.  

latest test stats:
```
with internal redirect x 122,570 ops/sec ±0.74% (96 runs sampled)
without internal redirect x 126,179 ops/sec ±1.02% (87 runs sampled)
```

Runway is built upon lodash-node, the best performance-oriented utility library available.
JsPerf.com is the first place of reference for runtime performance design considerations.

## Usage Example:

routes.js
```js
var router = require('../runway')

/**
 * Controllers
 */
var controllers = {}
controllers.index = function(req, res, args){
    res.end('index')
}
controllers.home = function(req, res, args){
    res.end('home')
}
controllers.users = function(req, res, args){
    res.end('users')
}
/**
 * Filters
 */
function isMobile(req, res, args, ops, next){
    if (/mobile/g.test(req['user-agent']))
        ops.i_redirect(controllers.index)
    else
        next()
}
function hasAuth(req, res, args, ops, next){
    // auth logic goes here...
    next()
}
/**
 * Routes
 */
router
( '/', controllers.index )
( 'home/', controllers.home  )
( 'home/users/{int}/', controllers.users )
.group( '/api/update/', [isMobile, hasAuth] ) // route filters
    ( '/admins/name-{any}/', function(){} )
    ( '/users/{a-z}/', function(req,res,args){
        res.end(args[0])
    })
.endgroup
( 'more/', function(req,res){ res.end('more') } )
```

main.js
```js
require('./routes.js')
var router = require('runway')
var server = require('http').createServer(router.listener)
server.listen(8080)
```


## Description
Runway.js router module for node.js. It is a minimalist, tree-based, performance-oriented
solution, intended to support large projects with many routes.

The syntax is designed to be simplistic, uncluttered, and feature-rich.

## Features
Route to any standard request event listener (any function which receives request
and response objects, as per standard node.js convention). Group routes upon a common
base path and optionally, shared controller and/or route filters. Use
router.config({fail:yourFunc}) to override the default 404 handler. Provide
router.listener as the callback to the standard node.js httpServer request event
and you're good to go.

## How it works:
Runway creates a nested object out of each route, representing a single branch of the
tree. It then merges that branch object into the tree object, which automatically
combines matching paths, including path segments which have matching regular
expressions.

Router.listener is your main node request listener. When a request event fires,
listener() climbs the tree until it reaches the end of the path and finds a leaf
node. A leaf node is an array of functions, where the last function is the controller
you provided. Each function before that is a route filter, which receives all the
same arguments as the controller, and so has access to modify any of the data in
those objects, before the controller is invoked. The ops object also provides utility
features, such as i_redirect() and redirect(). i_redirect() allows you to change the
controller, while redirect() sends an actual 302 response with whatever destination
you provide.


## Future To-Do's:

* Develop and test FSM implementation over native RegExp.
* Provide HTTP method-specific routing.


## How To Run The Tests

```
$ git clone http://github.com/rm-rf-etc/runway.git
$ cd runway
$ npm install
$ npm install benchmark
$ node test/test.js
```

## License

The MIT License (MIT)

Copyright (c) 2013 Rob Christian

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
