
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

( 'more/', function(req,res){ res.end('more') } )
