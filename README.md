Runway.js
==========

Stupidly simple, performance-oriented router module for node.js apps. Belongs to the Encore framework
project: [encore.jit.su](http://encore.jit.su) | [github.com/rm-rf-etc/encore](http://github.com/rm-rf-etc/encore)  

[![NPM](https://nodei.co/npm/runway.png?downloads=true)](https://nodei.co/npm/runway/)

## Intro...
Runway is currently in beta. Please consider contributing or staring this repo on npm
if you like what has been done so far.

To see the examples, clone it from [github](http://github.com/rm-rf-etc/runway), and then  

* tryout `node examples/basic.js` and then browse to `localhost:8080/`.  
* find additional tests in `node test/test.js`.  
* try running `node test/perf.js` to run the performance tests.  

latest test stats (19-Dec-2013):
```
with internal redirect x 120,344 ops/sec ±0.66% (91 runs sampled)
without internal redirect x 117,947 ops/sec ±0.81% (98 runs sampled)
```

Runway is built upon lodash-node, the best performance-oriented utility library available.
JsPerf.com is the first place of reference for runtime performance design considerations.

## Usage:

router is a function having the following arguments convention:
```
router  ( string url        [, filters],        controller             )
group   ( string base_url   [, default filters] [, default controller] )
grouped route  ( string url [, filters]         [, controller]         )
```
* [] = optional argument.  
* filters = array of functions which accept (request, response, arguments, methods, callback). A filter must invokde callback(), or method.error(code), or method.redirect(url).  
* controller = function which accepts (request, response, arguments, methods).  
* default = object to use if grouped route does not provide its own.  


_routes.js_
```js
// find this code under examples/ in the github repo.
var router = require('../runway')

/**
 * Controllers
 */
// i = input, o = output, a = args, r = router-provided methods
var controllers = {}
controllers.index = function(i,o,a,r){ o.end('index') }
controllers.users = function(i,o,a,r){ o.end('users') }
controllers.home  = function(i,o,a,r){ o.end('home')  }
controllers.basic = function(i,o,a,r){ o.end('default. args: '+a) }

// This is probably the simplest approach to RESTful resource controllers in JS.
controllers.myResource = function(i,o,a,r){
    var fn = controllers.myResource[i.method.toLowerCase()]
    if (fn)
        fn(i,o,a,r)
    else
        r.error('404')
}
controllers.myResource.get = function(i,o,a,r){ o.end('get received') }
controllers.myResource.post = function(i,o,a,r){ o.end('post received') }
controllers.myResource.put = function(i,o,a,r){ o.end('put received') }
controllers.myResource.delete = function(i,o,a,r){ o.end('delete received') }

/**
 * Filters
 */
function isMobile(i,o,a,r,next){
    if (/mobile/g.test(i['user-agent']))
        r.i_redirect(controllers.index)
    next()
}
function hasAuth(i,o,a,r,next){
    // auth logic goes here...
    next()
}
// This is one way to restrict protocol types.
function GET(i,o,a,r,next){ (i.method !== 'GET') ? r.error('404') : next() }
function POST(i,o,a,r,next){ (i.method !== 'POST') ? r.error('404') : next() }

/**
 * Routes
 */
router.config( {logger: console.log} )

( '/', controllers.index )
( 'home/', controllers.home )
( 'home/users/{int}/', [GET], controllers.users )
//      route filters    ^

// This is to show how groups behave.
.group( '/api/v1/', [isMobile, hasAuth], controllers.basic )
    ( '/user/edit/{any}/', [GET] ) // <--this filter overrides those that were provided in the group declaration.
    ( '/user/update/{any}/', [POST], controllers.users )
    ( '/admin/edit/{any}/', controllers.myResource )
    ( '/moderator/edit/{any}/' )
.endgroup

( 'more/', function(i,o){ o.end('more') } )
```

_basic.js_
```js
require('./routes.js')
var router = require('runway')
var server = require('http').createServer(router.listener)
server.listen(8080)
```

### Configuration API
You can add your own wildcard expressions:
```js
// The properties 'card' and 'pattern' must both be strings. Patterns must contain
// a parenthesis group, so the value can be captured during routing. Use curly braces
// around cards since they're invalid URL characters, you will never receive a request
// containing the same pattern as your wildcard's name.
router.config({
    wildcards:[
        {card:'{xyz}', pattern:'(x|y|z)'    },
        {card:'{uid}', pattern:'(\d\d\d\d)' }
    ]
})
```

Provide your own 404 response:
```js
var handlebars = require('handlebars')
var tpl = require('fs').fileReadSync('fancy_errors_template.html')
var myFancyError = handlebars.compile(tpl.toString())

router.config({
    error: function(code,i,o,a){
        o.end( myFancyError({code:code}) )
    }
})
```

## Description
Runway.js, a router module for node.js. It is a minimalist, tree structure,
performance-oriented solution, intended to support large projects with many routes.

The syntax is designed to be simplistic, uncluttered, and feature-rich.

## Features
* Route to any standard request event listener (any function which receives request
and response objects, as per standard node.js convention).  
* Group routes upon a common base path, + optionally shared controller and/or
route filters.  
* router.config() provides functionality extension.  
* Override the default 404 handler.  
* Add your own wildcard expressions.  

Default wildcard patterns:  
```js
var wildcards = [
    { card: '{int}', pattern: '([1-9][0-9]*)'    },
    { card: '{any}', pattern: '([0-9a-zA-Z-_]+)' },
    { card: '{a-z}', pattern: '([a-zA-Z]+)'      },
    { card: '{num}', pattern: '([0-9]+)'         }
]
```

## How it works:
Runway creates a nested object out of each route, representing a single branch of the
tree. It then merges that branch object into the tree object, which automatically
combines matching paths, including path segments which have matching regular
expressions.

Router.listener is your main node request listener. When a request event fires,
listener() climbs the tree until it reaches the end of the path and finds a leaf
node. A leaf node is an array of functions, where the last function is the controller
you provided. If a leaf node is not found, the default 404 method is called, which
will send the reply, ending the current request.

### Using Filters:
Each function in the leaf node array is a filter, except the last one, which is
your controller. Otherwise they are identical. As such, you can easily reuse filtering
logic across large groups of routes, easily defining how to intercept incoming data
and how to modify it before finally invoking the controller.

_filter convention:_  
`function (request, response, arguments, routing, next) { /* logic */ }`  
Request and response you will recognize from all your regular node HTTP request
listeners.  

* Arguments is an array of values parsed from the URL, one for each wildcard you used.  
* Routing is an object containing callbacks for redirecting or responding with an error page:  

```
routing.i_redirect(controller) // Route instead to controller.
routing.redirect(url) // Send a 302 response with url as the destination.
routing.error(code) // Invokes default or configured function.
```  

* Next is a callback, invoke this to continue on to the next filter or the controller.

A filter must invoke either next(), routing.redirect(), or routing.error(). Otherwise
If next() is not invoked, the routing process will not continue through the filters,
on to the controller, and likely no response will be sent back, leaving the client
hanging.

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
