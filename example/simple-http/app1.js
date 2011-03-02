var http  = require('http')
  , wirez = require('wirez')
  , util = require('util')

  , srv  = wirez.r('./testapp/server').server
  , log  = wirez.newLogger('App1')

var boh='/boo0m'
var hello = '/hello'

exports.wirezStart = function() {
	log("Starting")

	srv.add(hello, function(req,res,urlinfo) {
		var name = "World"
		log(util.inspect(urlinfo))
		if(urlinfo.query && urlinfo.query.who) name = urlinfo.query.who
		res.writeHead(200, {'Content-Type': 'text/plain'})
		res.end('Hello ' + name + '!\n')
	})
	srv.add(boh, function(req,res,urlinfo) {
		res.writeHead(200, {'Content-Type': 'text/plain'})
		res.end(util.inspect(urlinfo))
	})
}

exports.wirezStop = function() {
	log("Stopping")
	
	srv.remove(hello)
	srv.remove(boh)
}