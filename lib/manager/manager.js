var util = require('util')
  , path = require('path')
  , wu   = require('wu').wu

var Manager = module.exports = function( wirez ) {
	this.wirez = wirez
	this.cwd = undefined
	
	this.comms = []
	this.log = this.wirez.newLogger('Wirez.Manager')
}

Manager.prototype.addComm = function( comm ) {
	var args=wu(arguments).toArray()
	args.shift()
	
	// require('wirez').manager.addComm('unixdomain','var/run/wirez')
	// require('wirez').manager.addComm('tcp',8888)
	if(typeof comm == 'string') {
		this.log('Adding io server '+comm)
		args.unshift(this)
		var module = require('./io/'+comm)
		comm = module.newServerSide.apply(module,args)
	// probably noone is going to use it like this
	} else if(typeof comm == 'function') {
		args.unshift(this)
		comm = comm.apply(null,args)
	}
	
	this.comms.push(comm)
	var s = this
	comm.start( function() {
		comm.onRPC( Manager.prototype.handle,s )
	} )
}
Manager.prototype.getClient = function( comm ) {
	var args = wu(arguments).toArray()
	args.shift()
	var module = require('./io/'+comm)
	return module.newClientSide.apply(module,args)
}

Manager.prototype.start = function(  ) {
	this.log('Starting')
//	this.cwd = cwd || process.cwd()
	var s = this
	this.wirez.on('shutdown',function(){
		s.log('Shutting down')
		wu(s.comms).each(function(comm){comm.stop()})
	})
}

Manager.prototype.handle = function( cmd ) {
	this.log('Executing command '+cmd.cmd)
	var cmdPath = path.join(__dirname,'command',cmd.cmd)

	if(!path.existsSync(cmdPath + '.js')) { return { done:false, response: 'Command not found: '+cmd.cmd } }
	
	args = cmd.args || []
	args.unshift(this.wirez)
	var cmdmod = require(cmdPath)
	try {
		return cmdmod.handle.apply(cmdmod,args)
	} catch(e) {
		return { done:false, response: e }
	}
	return cmdmod.handle.apply(cmdmod,args)
}