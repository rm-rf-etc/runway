
var _ = require('lodash')
var util = require('util')
var router = require('../runway')

var tracker = 0
var log = []
function logThis(x){
    log[log.length] = x
}

router
('/', controllerA)
('home', controllerA)
('login', controllerB)
('logout', controllerB)

.group('markets', [increment, increment, isMobile, increment])
    ('import/{int}/a/{a-z}', controllerA)
    ('import/{int}/b/{a-z}', controllerB)
    ('export/{int}/c/{a-z}', controllerA)
    ('export/{int}/d/{a-z}', controllerB)
.endgroup

/**
 * Some filters.
 */
function increment(req, res, args, ops, next){
    setTimeout(function(){
        logThis('Response from filter: '+tracker++)
        next()
    }, 100)
}
function isMobile(req, res, args, ops, next){
    if (/mobile/g.test(req['user-agent']))
        ops.i_redirect(controllerB)
    else
        next()
}
function hasAuth(req, res, args, ops, next){
    if (req.session !== 'some_key')
        ops.redirect('/')
    else
        next()
}


/**
 * Some controllers.
 */
function controllerA(req, res, args){
    logThis('Response from controller')
    res.end('Response from controller')
}
function controllerB(req, res, args){
    res.end('B')
}

/**
 *
 */
var Events = require('events').EventEmitter
var events = new Events
events.on('request',router.listener)

events.emit('request',{url:'/markets/import/123/a/ABC',"user-agent":'chrome'},{end:console.log})

console.log(log)
setTimeout(function(){
    console.log(log)
}, 1000)

