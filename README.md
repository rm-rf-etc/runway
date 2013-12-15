Runway.js
==========

Stupidly simple, performance-oriented router module for node.js apps.

`npm install runway`

version: 0.0.11-beta

## Usage

This is currently in beta, so certain features are not yet working. Route filters (as shown in the usage example)
don't currently work. Capturing the arguments from the URL and passing them to the controller is not implemented
either, but you can easily pull them out by parsing req.url using a regex. Refer to the toRegExp() method to see
the patterns which correspond to the URL wildcard patterns, {any}, {num}, {int}, {a-z}. An example URL like this:  
`home-{a-z}/users/{any}/associate/{num}/like/{int}`  
would translate to a pattern like this:  
`new RegExp('home-([a-zA-Z]+)/users/([0-9a-zA-Z-_]+)/associate/([0-9]+)/like/([0-9]|[1-9][0-9]*)')`

You would then use RegExp.exec() to get an array containing your values. Here is a quick paste of this done
in the node.js REPL:
```
> var thing = new RegExp('home-([a-zA-Z]+)/users/([0-9a-zA-Z-_]+)/associate/([0-9]+)/like/([1-9][0-9]*)')
undefined
> thing.exec('home-asdfg/users/098asdf/associate/00345/like/12345')
[ 'home-asdfg/users/098asdf/associate/00345/like/12345',
  'asdfg',
  '098asdf',
  '00345',
  '12345',
  index: 0,
  input: 'home-asdfg/users/098asdf/associate/00345/like/12345' ]
> 
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

main.js
```js
require('./routes.js')
var router = require('runway')
var server = require('http').createServer(router.listener)
server.listen(8080)
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
