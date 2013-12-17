Runway.js
==========

Stupidly simple, performance-oriented router module for node.js apps.

`npm install runway`

version: 0.0.2-beta

## Usage

Runway is currently in beta. Please consider contributing if you like what has been done so far.

Try running `node test/test.js` to see routes working and with working route filters.  
Try running `node test/perf.js` to run the performance tests.  
Tryout `node examples/basic.js` and then browse to `localhost:8080/`.

latest test stats:
```
with internal redirect x 122,570 ops/sec ±0.74% (96 runs sampled)
without internal redirect x 126,179 ops/sec ±1.02% (87 runs sampled)
```

### Usage Example:

routes.js
```js
var router = require('runway')
var controllers = require('YourControllerFunctions')

router
( '/', controllers.index )
( 'home/', controllers.home  )
( 'home/users/{int}/', controllers.users )
.group( 'api/update/', [isMobile, hasAuth] ) // route filters
    ( '/users/{a-z}/', controllers.api.users  )
    ( '/admins/name-{any}/' controllers.api.admins )
.endgroup
( 'more/', controllers.whatever )


function isMobile(req, res, args, ops, next){
    if (/mobile/g.test(req['user-agent']))
        ops.i_redirect(controllers.mobile)
    next()
}
function hasAuth(req, res, args, ops, next){
    // auth logic goes here...
    next()
}
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
and response objects, as per standard node.js convention). Group routes upon a base
path and/or shared controller and route filters. Use router.config({fail:yourFunc})
to override the default failure handler. Provide router.listener as the callback to
the standard node.js httpServer request event and you're good to go.


#### How it works:
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


### Future To-Do's:

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
