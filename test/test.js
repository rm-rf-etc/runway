
var _ = require('lodash-node')
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
    ('{num}/users/{any}/managers/{any}/settings', function Q(){ return 'works!' })
.endgroup

// Test for possible route mismatching
('home-{a-z}/users/{any}/associate/{any}/like/{any}', A)
('user-{int}/users/{any}/associate/{any}/like/{any}', B)
('name-{any}/users/{any}/associate/{any}/like/{any}', C)



// console.log( require('util').inspect(map,{depth:7}) )
router.listener({ url:'/home-gHhq/users/000/associate/000/like/ui9-1' }, { end:function(){} })
router.listener({ url:'/user-5555/users/000/associate/000/like/t-t-0' }, { end:function(){} })
router.listener({ url:'/name-Q9-0/users/000/associate/000/like/3gio5' }, { end:function(){} })
router.listener({ url:'/my_store_api/123/users/ZZ-ZZ/managers/AsDf/settings' }, { end:function(){} })
function A(req, res){
    console.log( 'target: ', req, res )
}
function B(req, res){
    console.log( 'target: ', req, res )
}
function C(req, res){
    console.log( 'target: ', req, res )
}
function Q(req, res){
    console.log( 'target: ', req, res )
}



var bm = require('benchmark')
var suite = new bm.Suite
suite
.add('path trace',function(){
    _.noop( router.listener({url:'/my_store_api/123/users/ZZ-ZZ/associate/AsDf/first-time-met'}, {end:_.noop}) )
})
.on('cycle',function(e){
    console.log(String(e.target))
})
// .on('complete',function(){
//     console.log('Fastest was '+this.filter('fastest').pluck('name'))
// })
.run({'async':true})
/*
*/