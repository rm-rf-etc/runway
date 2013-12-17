require('./routes.js')
var router = require('../runway')
var server = require('http').createServer(router.listener)
server.listen(8080)