
var router = require('../runway')

/**
 * Controllers
 */
var controllers = {}
controllers.index = function(req, res, args){
    res.end('index')
}
controllers.users = function(req, res, args){
    res.end('users')
}
controllers.home = function(req, res, args){
    res.end('home')
}
/**
 * Filters
 */
function isMobile(req,res,args,ops,next){
    if (/mobile/g.test(req['user-agent']))
        ops.i_redirect(controllers.index)
    next()
}
function hasAuth(req,res,args,ops,next){
    // auth logic goes here...
    next()
}
// This is one way to restrict protocol types.
function GET(req,res,args,ops,next){ (req.method !== 'GET') ? ops.send404() : next() }
function POST(req,res,args,ops,next){ (req.method !== 'POST') ? ops.send404() : next() }
/**
 * Routes
 */
router.config( {logger: console.log} )

( '/', controllers.index )
( 'home/', controllers.home  )

// to respond only to certain methods, use a filter:
( 'home/users/{int}/', [GET], controllers.users)

// This is just to show how groups behave.
.group( '/api/v1/', [isMobile, hasAuth], function a(i,o,a){ o.end('default. args: '+a) } ) // route filters
    ( '/user/edit/{any}/', [GET] )
    ( '/user/update/{any}/', [POST] )
    ( '/admin/edit/{any}/', function b(i,o,a){ o.end('name is: '+a[0]) } )
    ( '/moderator/edit/{any}/' )
.endgroup

( 'more/', function(req,res){ res.end('more') } )

