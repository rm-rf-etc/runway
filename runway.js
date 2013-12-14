
var _ = require('lodash-node')
var routes_tree = Object.create(null)


// Replace predefined keys in a given string, with associated regular expression.
function toRegExp(string){
    var replacements = [
            {a: /\{int\}/g, b: '([0-9]|[1-9][0-9]*)'},
            {a: /\{any\}/g, b: '[0-9a-zA-Z-_]+'},
            {a: /\{a-z\}/g, b: '[a-zA-Z]+'},
            {a: /\{num\}/g, b: '[0-9]+'}
        ]
    for (var i=0; i < replacements.length; i++)
        string = string.replace(replacements[i].a, replacements[i].b)
        
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



// Default failure handler (when no matching route is found). Use config() to override.
function fail(req, res){
    res.end('404')
}
router.config = function(options){
    if (options && options.fail)
        fail = options.fail
}
/**
 * Although possibly confusing to read, this minimalist set of nested closures
 * is the entire router API (aside from router.config()).
 */
function router(first_route, c, f){

    // c is for controller, f is for filters.
    function add(url, c, f){
        var nested

        // Convert route string into array of path segments.
        url = url.replace(/(^\/|\/$)/g,'').split('/')
        url = [].concat(url).concat('Ω')
        nested = newBranch(url, c)

        // Now include the new route in our routes map object.
        _.merge(routes_tree, nested, function(a,b){
            var arr = a || b
            if (_.isArray(a))
                return _.uniq(a.concat(b), function(x){return x.toString()})
            else if (_.isArray(b))
                return b
        }) // Arrays are used for storing any segments which contain regex.

        return add
    }

    // Mainly for easier readability, allows router.add()()()()...
    router.add = add
    // router.get = function(){}
    // router.put = function(){}
    // router.post = function(){}
    // router.delete = function(){}
    // ^ coming soon...

    add.group = function(base_url, c, f){
        base_url = base_url.replace(/(^\/|\/$)/g,'')

        function sub_route(new_sub_route, c2, f2){
            new_sub_route = new_sub_route.replace(/(^\/|\/$)/g,'')
            
            c = (_.isFunction(c2))  ? c2 : c
            f = (_.isArray(f2))     ? f2 : f

            add(base_url+'/'+new_sub_route, c, f)
            return sub_route
        }
        sub_route.endgroup = add
        return sub_route
    }

    return add(first_route, c, f)
}



/**
 * Less abstraction is good for performance. Pass this to your server object;
 * it's the request event listener. It will try to match the requested URL and
 * and invoke the associated controller, or otherwise invoke fail(), which
 * calls req.end('404') as the default. But you can override it using config().
 */
router.listener = function(req, res){

    // Convert route into array of URL segments, ending with "Ω", the leaf node.
    var route = req.url.slice(1).replace(/\/$/g,'').split('/').concat('Ω')

    // Climb the routes map, always check first for a matching static route segment.
    var c =  _.reduce(route, function(obj, seg){
        if (obj) {
            var norm = obj[seg] || undefined
            if (norm)
                return norm
            else {
                var regs = obj['{regex}'] || undefined
                if (regs) {
                    for (var i=0; i < regs.length; i++) {
                        if (regs[i].test(seg))
                            return obj[regs[i].toString()]
                    }
                }
            }
        }
    }, routes_tree) // <-- This is the object to climb.

    if (c) c(req,res)

    else fail(req, res)
}



module.exports = router

