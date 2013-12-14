Runway.js
==========

Stupidly simple, performance-oriented router module for node.js apps.

`npm install runway`


## Usage

```js
var controllers = require('YourControllerFunctions')

router
( '/', controllers.index )
( 'home/', controllers.home  )
( 'home/users/{int}/', controllers.users )
.group( 'api/update/', [isMobile, hasAuth] )
    ( '/users/{a-z}/', controllers.api.users  )
    ( '/admins/name-{any}/' controllers.api.admins )
.endgroup
( 'more/', controllers.whatever )

function isMobile(d, save){
    if (/mobile/g.test(d.req['user-agent']))
        save({controller: controllers.mobile})
}
function hasAuth(d, save){
    // auth logic goes here...
}
```


## Description

Runway.js is a minimalist, tree-based, routing module, with the goal of continually
improving in performance, wherever possible.

## Features

Route to any standard request event listener (any function which receives request
and response objects, as per standard node.js convention). Group routes upon a base
path and/or shared controller and route filters _(filters not implemented at the moment)_.
Use router.config({fail:yourFunc}) to override the default failure handler. Provide
router.listener as the callback to the standard node.js httpServer request event and
you're good to go.


#### How it works:
Runway creates a nested object out of each route, representing a single branch of the
tree. It then merges that branch object into the tree object, which automatically
combines matching paths, including path segments which have matching regular
expressions.


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
