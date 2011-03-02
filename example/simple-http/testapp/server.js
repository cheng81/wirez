var http = require('http')
  , url  = require('url')
  , util = require('util')
  , log  = require('wirez').newLogger('Server')

var MyServer = function(port) {
	var s = this
	this.apps = {}
	this.srv = http.createServer(function(req,res) {
		var urlinfo = url.parse(req.url,true)
		if(s.apps[ urlinfo.pathname ]) {
			s.apps[ urlinfo.pathname ](req,res,urlinfo)
		} else {
			res.writeHead(404)
			res.end()
		}
	})
	this.srv.listen(port, "127.0.0.1")
}
MyServer.prototype.add = function(path,fun) {
	log("Adding app at " + path)
	this.apps[path] = fun
}
MyServer.prototype.remove = function(path) {
	log("Removing app at " + path)
	delete(this.apps[path])
}

exports.wirezStart = function() {
	var port = '9090'
	log('Starting MyServer at port ' + port)
	var _server = new MyServer(port)
	exports.server = _server
}
exports.wirezStop = function() {
	if(exports.server){
		log("shutting down http server...")
		exports.server.srv.close()
		log("...done")
	}
}