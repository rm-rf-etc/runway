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
    next()
}
function hasAuth(req, res, args, ops, next){
    // auth logic goes here...
    next()
}
function verbIs(type){ // If you want method specific routes...
    return function(req,res,args,ops,next){
        if (req.method !== type)
            ops.send404()
        else
            next()
    }
}
/**
 * Routes
 */
router
( '/', controllers.index )
( 'home/', controllers.home  )

// to respond only to certain methods, use a filter:
( 'home/users/{int}/', controllers.users, verbIs("POST"))

.group( '/api/update/', [isMobile, hasAuth] ) // route filters
    ( '/admins/name-{any}/', function(req,res,args){
        res.end(args[0])
    })
    ( '/users/{a-z}/', function(req,res,args){
        res.end(args[0])
    })
.endgroup

( 'more/', function(req,res){ res.end('more') } )

