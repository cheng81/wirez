var util = require('util')
  , net = require('net')

module.exports.newServerSide = function( mngr,port,enc ) {
	return new Server(port,enc)
}
module.exports.newClientSide = function( port,enc,onresponse ) {
	return new Client(port,enc,onresponse)
}

var Server = function(port,enc) {
	var s = this
	this.enc = enc
	this.port = port
	this.ssock = net.createServer(function(socket){s.handle(socket)})
	
	this.closed=false
	this.ssock.on('close',function(){s.closed=true})
}
Server.prototype.start = function(cb) {
	this.ssock.listen(this.port)
	cb(this)
}
Server.prototype.stop = function() {
	if(this.closed) return
	this.ssock.close()
}
Server.prototype.onRPC = function( callback,context ) {
	this.RPCcallback = callback
	this.onRPCContext = context || this
}
Server.prototype.handle = function(socket) {
	var s = this
	socket.setEncoding(this.enc)
	socket.on('data',function(data) {
		var command = JSON.parse( data )//msg.toString( this.enc ) )//msg.toString( this.enc ).split('\n')
		var out = s.RPCcallback.apply( s.onRPCContext, [command] )
		if(out.onSent){ 
			var onsent = out.onSent
			socket.on('end',onsent)
			delete (out.onSent)
		}
		out = JSON.stringify(out)
		socket.end(out)
	})
}

var Client = function(port,enc,onresponse) {
	var s = this
	this.sock = net.createConnection(port)
	this.sock.setEncoding(enc)
	this.sock.on('data',function(data) {
		onresponse(JSON.parse(data))
		s.sock.end()
	})
	this.closed=false
	this.sock.on('end',function(){s.closed=true})
}
Client.prototype.stop = function() {
	if(this.closed) return
	this.sock.end()
}
Client.prototype.RPC = function( cmd,args ) {
	var command = { cmd:cmd }
	if(args&&!(args instanceof Array)){ args = [args] }
	command.args = args || []
	var str = JSON.stringify(command)
	this.sock.write(str)
}









