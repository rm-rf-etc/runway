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

