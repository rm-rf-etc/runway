
/*

Semi-colon line terminators are just FUD. If your minifier can't handle this code, switch to one that is JS-compliant.
http://blog.izs.me/post/2353458699/an-open-letter-to-javascript-leaders-regarding
http://inimino.org/~inimino/blog/javascript_semicolons

The only time you EVER need a semi-colon for statement termination:
;[1,2,3].map(function(val){ 'do stuff' })
;(function(){ 'do stuff' })

*/

var runway = require('./runway.js')
var active_controller
runway.bind('route added',function(){
	var ctrl = runway.go(location.pathname)
	if (ctrl && ctrl !== active_controller) {
		active_controller = ctrl
		active_controller()
	}
})

module.exports = runway

runway.hijackAnchors = function(hijack) {
	if (hijack) {
		document.onclick = function(event) {
			event = event || window.event // IE specials
			event.preventDefault()
			var target = event.target || event.srcElement // IE specials

			if (target.tagName == 'A' || target.tagName == 'BUTTON') {
				processLink(target.href, target.dataset.ajax)
			}
		}
	}
	else {
		document.onclick = function(event) {
			event = event || window.event // IE specials
			var target = event.target || event.srcElement // IE specials

			if (target.tagName == 'BUTTON') {
				processLink(target.href, target.dataset.ajax)
			}
		}
	}
}

window.onpopstate = function(event){ doRoute(event.state.url) }
function init(){
	history.replaceState( {url:location.pathname}, null, location.pathname )
}
window.addEventListener ? addEventListener('load', init, false) : window.attachEvent ? attachEvent('onload', init) : (onload = init)



function processLink(href, ajax){
	console.log('processLink', href)
	href = href.replace(location.origin,'')
	if (ajax !== 'none') {
		goForward(href)
		doRoute(href)
		return false
	}
	return true
}

function doRoute(href){
	active_controller = runway.go(href)
	if (active_controller) active_controller()
}

function goForward(url){
	if (history.pushState) history.pushState({url:url}, null, url)
	else location.assign(url)
}

