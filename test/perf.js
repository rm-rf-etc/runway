
var _ = require('lodash-node')
var util = require('util')
var router = require('../runway')


router
('login', _.noop)
('login/login', _.noop)
('logout', _.noop)

.group('api/v1/')
    ('track_event', _.noop)
    ('save_user_info', _.noop)
    ('get_market_info', _.noop)
    ('get_user_info', _.noop)
.endgroup

('Api', _.noop)

.group('markets')
    ('export/{any}/{any}/{num}', _.noop)
    ('export/{any}/{any}/{num}/{any}', _.noop)
    ('import/{any}/{any}/{num}', _.noop)
    ('import/{any}/{any}/{num}/{any}', _.noop)
.endgroup

('sandbox/a{any}/{num}', _.noop)
('gizmos/sandbox/b{any}/{num}', _.noop)
('gizmos/c{any}/d{any}/{num}', _.noop)
('markets/e{num}', _.noop)
('markets/f{num}/g{any}', _.noop)

('shell/{num}', _.noop)
('shell/accepted/{num}', _.noop)
('shell/rejected/{num}', _.noop)

('filters/{num}/{any}', _.noop)
('products/{num}', _.noop)
('users/{num}/{any}', _.noop)
('users/{num}', _.noop)
('comments/{num}', _.noop)
('comments/{num}', _.noop)
('comments/{int}/{num}', _.noop)
('comments/a-{a-z}/{num}', _.noop)

('my_store/{num}', _.noop)
.group('my_store/{num}')
    ('config', _.noop)
    ('collections', _.noop)
    ('collections/{any}', _.noop)
.endgroup

('p{num}/users/{any}/associate/{any}', _.noop)
.group('my_store_api/{num}/users/{any}/associate/{any}')
    ('/activate/{num}', _.noop)
    ('/category/features/{num}', _.noop)
    ('/update_last', _.noop)
    ('/contact-rep', _.noop)
    ('/update', _.noop)
.endgroup

.group('my_store_api')
    ('get-market/{any}', _.noop)
    ('market/{num}', _.noop)
    ('name-{any}/campaigns/{any}/products', _.noop)
    ('{num}/users/{any}/has-shared', _.noop)
    ('{num}/users/{any}/{num}', _.noop)
    ('{num}/users/{any}', _.noop)
    ('{num}/people', _.noop)
    ('{num}/users/{any}/managers/{any}/settings', _.noop)
.endgroup

// Test for possible route mismatching
('home-{a-z}/users/{any}/associate/{any}/like/{any}', printA, [a,isMobile])
('user-{int}/users/{any}/associate/{any}/like/{any}', printB, [a,isMobile])
('name-{any}/users/{any}/associate/{any}/like/{any}', printC, [a,isMobile])



router.listener({ url:'/home-gHhq/users/000/associate/000/like/ui9-1', "user-agent":'chrome' }, { end:console.log })
router.listener({ url:'/user-5555/users/000/associate/000/like/t-t-0', "user-agent":'chrome' }, { end:console.log })
router.listener({ url:'/name-Q9-0/users/000/associate/000/like/3gio5', "user-agent":'mobile' }, { end:console.log })

/**
 * Some test controllers.
 */
function printA(req, res, args){
    res.end( 'A controller ', args )
}
function printB(req, res, args){
    res.end( 'B controller ', args )
}
function printC(req, res, args){
    res.end( 'C controller ', args )
}
function mobile(req, res, args){
    res.end( 'mobile controller ', args )
}

/**
 * Some route filters.
 */
function a(req, res, args, ops, next){
    args[1] = parseInt(args[1],10) + 3
    next()
}
function isMobile(req, res, args, ops, next){
    if (/mobile/g.test(req['user-agent']))
        ops.i_redirect(mobile)
    else
        next()
}


/**
 * Our tests.
 */
var bm = require('benchmark')
var suite = new bm.Suite
console.log = function(){
    throw new Error('Oops! Not during performance testing, console.log() will hang your program.')
}
suite
.add('with internal redirect',function(){
    _.noop( router.listener({ url:'/name-Q9-0/users/000/associate/000/like/3gio5', "user-agent":'mobile' }, { end:function(){} }) )
})
.add('without internal redirect',function(){
    _.noop( router.listener({ url:'/name-Q9-0/users/000/associate/000/like/3gio5', "user-agent":'chrome' }, { end:function(){} }) )
})
.on('cycle',function(e){
    process.stdout.write(String(e.target) + '\n')
})
// .on('complete',function(){
//     console.log('Fastest was '+this.filter('fastest').pluck('name'))
// })
.run({'async':true})
/*
*/