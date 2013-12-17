var router = require('../runway')

/**
 * Controllers
 */
var controllers = {
    index:function(req, res, args){
        res.end('index')
    },
    home:function(req, res, args){
        res.end('home')
    },
    users:function(req, res, args){
        res.end('users')
    }
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
.group( 'api/update/', [isMobile, hasAuth] ) // route filters
    ( '/users/{a-z}/', function(){} )
    ( '/admins/name-{any}/', function(){} )
.endgroup
( 'more/', function(){} )

