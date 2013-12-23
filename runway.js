
var _ = require('lodash-node')

var routes_tree = Object.create(null)

var logger = undefined
var wildcards = [
    { card: '{int}', pattern: '([1-9][0-9]*)'    },
    { card: '{any}', pattern: '([0-9a-zA-Z-_]+)' },
    { card: '{a-z}', pattern: '([a-zA-Z]+)'      },
    { card: '{num}', pattern: '([0-9]+)'         }
]



/**
 * Although possibly confusing to read, this minimalist set of nested closures
 * is the entire API for defining routes (aside from router.config()).
 */
function router(){

    add.group = group
    add.config = config
    add.group.config = config

    // c is for controller, f is for filters.
    function add(url, f, c){
        var Ω, nested

        if (typeof url !== 'string')
            throw new Error('Router accepts only a string as the first argument.')

        c = arguments[arguments.length-1]
        f = (_.isArray(f)) ? f : []

        if (!_.isFunction(c)) throw new Error('Controller either not specified or invalid.')
        _.each(f,function(e){
            if (!_.isFunction(e)) throw new Error('Filter is not a function: '+{}.toString.apply(e))
        })

        Ω = [].concat(f).concat(c)

        if (logger)
            logger('add route:', url, 'filters and controller:', Ω)
        // Convert route string into array of path segments.
        url = url.replace(/(^\/|\/$)/g,'').split('/')
        url[url.length] = 'Ω'
        nested = newBranch(url, Ω)

        // Now include the new route in our routes map object.
        _.merge(routes_tree, nested, function(a,b){
            var arr = a || b
            if (_.isArray(a))
                return _.uniq(a.concat(b), function(x){if (x) return x.toString()})
            else if (_.isArray(b))
                return b
        }) // Arrays are used for storing any segments which contain regex.

        return add
    }

    function group(base_url, f, c){
        c = arguments[arguments.length-1]
        f = (_.isArray(f)) ? f : undefined
        c = (_.isFunction(c)) ? c : undefined

        base_url = base_url.replace(/(^\/|\/$)/g,'')

        function sub_route(new_sub_route, f2, c2){
            new_sub_route = new_sub_route.replace(/(^\/|\/$)/g,'')

            c2 = arguments[arguments.length-1]
            c2 = (_.isFunction(c2)) ? c2 : c
            f2 = (_.isArray(f2)) ? f2 : f

            if (!c2)
                throw new Error('Controller not specified.')
            if (f2)
                add.apply(null, [base_url+'/'+new_sub_route, f2, c2])
            else
                add.apply(null, [base_url+'/'+new_sub_route, c2])

            return sub_route
        }
        sub_route.endgroup = add
        sub_route.group = group
        sub_route.config = config
        
        return sub_route
    }

    return add.apply(null, arguments)
}
router.config = config

/**
 * Configuration API.
 */
function config(options){

    if (options) {
        // Override default 404 response function.
        if (options.error && _.isFunction(options.error))
            sendError = options.error

        // Provide a callback to use for logging. Change to null/false/undefined to disable.
        if (options.logger && _.isFunction(options.logger))
            logger = options.logger

        // Add new wild card expressions.
        if (options.wildcards && _.isArray(options.wildcards)) {
            wildcards = _(wildcards).concat(options.wildcards).where(function(obj){
                return obj.card && obj.pattern && _.isString(obj.card) && _.isString(obj.pattern)
            }).value()
        }
    }

    return router
}


// Default failure handler (when no matching route is found). Use config() to override.
function sendError(code, req, res, args, ops){
    res.end(code)
}
/**
 * Less abstraction is good for performance. Pass this to your server object;
 * it's the request event listener. It will try to match the requested URL and
 * and invoke the associated controller, or otherwise invoke error(), which
 * calls req.end('404') as the default. But you can override it using config().
 */
router.listener = function(req, res){

    var Ω, ops, route, args, norm, regs, redirect, i, n
    args = []
    n = 0

    ops = {
        i_redirect: function(fn){ // replace the controller with a different one.
            Ω[Ω.length-1] = fn
        },
        redirect: function(url){ // immediately respond with a 302 redirect.
            res.writeHead(302, {'Location': url})
            res.end()
        },
        error: function(code){
            sendError(code,req,res)
        }
    }

    // Convert route into array of URL segments, ending with "Ω", the leaf node.
    route = req.url.slice(1).replace(/\/$/g,'').split('?')[0].split('/')
    route[route.length] = 'Ω'

    // Climb the routes map, always check first for a matching static route segment before trying regex.
    Ω =  _.reduce(route, function(obj, seg){
        if (!obj) return

        norm = obj[seg] || undefined
        if (norm)
            return norm
        
        regs = obj['{regex}'] || undefined
        if (regs) {
            for (i=0; i < regs.length; i++) {
                if (regs[i].test(seg)) {
                    args[n++] = regs[i].exec(seg)[1] // Increments n after the value is used for the assignment. More performant than .push().
                    return obj[regs[i].toString()]
                }
            }
        }
    }, routes_tree) // <-- This is the object to climb.

    i = -1
    if (Ω) {
        // Execute in order, each function stored in the leaf node. (note: Ω[i++] != Ω[++i])
        (function next(){
            i++
            if (Ω[i])
                Ω[i](req, res, args, ops, next)
            else
                sendError('404', req, res, args, ops)
        })()
    }
    else sendError('404', req, res, args, ops)
}



/**
 * Helpers
 */
// Swap keys for values in a given string and return it as a regular expression.
function toRegExp(string){
    _(wildcards).each(function(e){
        string = string.replace(e.card, e.pattern)
    })
    
    return new RegExp(string)
}
// A branch is a series of nested objects.
function newBranch(array, fn){
    return _.reduce(array.reverse(), function(cumulate, segment){
        var x = Object.create(null)
        if (/\{...\}/g.test(segment)) {
            var re = toRegExp(segment)
            x['{regex}'] = [re]
            x[re.toString()] = cumulate
            return x
        } else {
            x[segment] = cumulate
            return x
        }
    }, fn)
}



/**
 */
module.exports = router
