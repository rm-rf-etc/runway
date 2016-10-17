
/*!
 * Runway Router
 * Copyright(c) 2015 Rob Christian
 * MIT Licensed
 */

var typeOf = require('typeof').typeOf

var routes_tree = Object.create(null)
var configs = {}
var every_time
var logger
var countdown = 0
var intvl
var wildcards = {
  '{int}': '([1-9][0-9]*)',
  '{any}': '([^/]*)',
  '{a-z}': '([a-zA-Z]+)',
  '{num}': '([0-9]+)'
}


function Runway(args){
  this.routes = router
  this.go = pathMatcher
  this.listener = reqListener
  this.config = config
}
require('microevent').mixin(Runway)
var runway = module.exports = new Runway()



/**
 * Calling this function adds a new route.
 */
function router(arg1, f, c){

  var $, url, nested

  if (typeOf(arg1) === 'Array' && arg1.length && !f) {

    arg1.map(function(r){ router.apply(null,r) })

    return
  }

  if (typeof arg1 !== 'string')
    throw new Error('Router accepts only a string as the first argument.')
  url = arg1

  c = arguments[arguments.length-1]
  f = (Array.isArray(f)) ? f : []

  if (typeOf(c) !== 'Function') throw new Error('Controller either not specified or invalid.')
  f.forEach(function(e){
    if (typeOf(e) !== 'Function') throw new Error('Filter is not a function: '+{}.toString.apply(e))
  })

  $ = [].concat(f).concat(c)

  if (logger && typeOf(logger) === 'Function')
    logger('add route:', url, 'filters and controller:', $)
  // Convert route string into array of path segments.
  url = url.replace(/(^\/|\/$)/g,'').split('/')
  url[url.length] = '$'
  nested = newBranch(url, $)

  // Now include the new route in our routes map object.
  treeMerge(routes_tree, nested)
  runway.trigger('route added')

  return router
}


function reqListener(req, res){
  var ctrl = pathMatcher(req.url)
  if (ctrl) ctrl(req, res)
}


/**
 * Test a given URL. If it matches, return the leaf node from the routes_tree.
 */
function pathMatcher(url){
  if (! routes_tree) throw new Error('No routes defined.')

  var args = [], n = 0

  // Convert route into array of URL segments, ending with "$", the leaf node.
  var route = url.slice(1).replace(/\/$/g,'').split('?')[0].split('/')
  route[route.length] = '$'
console.log(route)
  var result = route.reduce(treeClimber, routes_tree)
  var ctrl
  if (result && result[0]) {
    ctrl = function(req,res){ // leaf node from matching route, or undefined.
      result[0](req,res,args)
    }
  } else {
    ctrl = configs[404] || null
  }
console.log(ctrl)
  return ctrl


  // We define this internally so that args and n are within scope.
  // Climb the routes tree. Always check first for a matching static route segment before trying regex.
  function treeClimber(obj, seg){
    if (! obj) return null

    return obj[seg] || (function(){
      var regs = obj['<regex>'] || undefined
      if (regs) {
        for (var i=0; i < regs.patterns.length; i++) {
          if (regs.patterns[i].test(seg)) {
            args[n++] = seg // Increments n after the value is used for the assignment.
            var matchingPattern = regs.patterns[i].toString()
            var nextSegment = regs[matchingPattern]
            return nextSegment
          }
        }
      }
    })()
  }
}

function config(opts){
  Object.keys(opts).forEach(function(key){
    configs[key] = opts[key]
  })
}




/**
 * Helpers
 */
// This converts an array representation of a complete route path, into a series of nested objects.
function newBranch(array, fn){
  return array.reverse().reduce(branchBuildingLogic, fn)
}

function branchBuildingLogic(cumulate, segment){
  var x = Object.create(null)

  if (! /^\{.+\}$/g.test(segment)) {
    x[segment] = cumulate
    return x
  }
  else {
    if (! wildcards[segment]) throw new Error('Unknown wildcard used in route: '+segment)

    var re = new RegExp(wildcards[segment])
    x['<regex>'] = { patterns: [re] }
    x['<regex>'][re.toString()] = cumulate
    return x
  }
}

// This merges a branch object (nested objects representing a route path) into our route tree object.
function treeMerge(to,from,fn){ //console.log(to,from,fn)
  Object.keys(from).map(function(prop){ //console.log('property:',prop)

    switch (true) {

      case prop === '<regex>':
        if (Object.hasOwnProperty.call(to,prop)) {
          from[prop].patterns.map(function(regex){
            if (hasMatchingRegex(to[prop].patterns, regex)) to[prop].patterns.push(regex)
          })
        }
        else to[prop] = from[prop]
        break

      case Object.hasOwnProperty.call(to,prop):
        treeMerge(to[prop],from[prop])
        break

      default:
        to[prop] = from[prop]

    }
    return
  })
}

function hasMatchingRegex(array,regex){
  return array.reduce(function(last,next){ return last || regexCompare(next,regex) }, false)
}

function regexCompare(a,b){
  return a.toString() === b.toString()
}

