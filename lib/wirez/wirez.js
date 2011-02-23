var util   = require('util')
  , wu     = require('wu').wu
  , path   = require('path')
  , events = require('events')

  , Dependencies = require('./dependencies')
  , WirezMod     = require('./wirezmod')
  , misc         = require('./misc')

var log = function(name) {
	return function() {
		var args = wu(arguments).toArray()
		var str = args.shift()
		args.unshift( name+'> '+str )
		util.log.apply(util,args)
	}
}
var Wirez = module.exports = function(cwd) {
	events.EventEmitter.call(this)
	
	this.wpath = cwd || process.cwd()
	this.wirezes = {}
	
	this.deps = new Dependencies('wirezesroot',{
		resolve: function(){return this}
	, start: function(){}
	, stop: function(){}
	, reload: function(){}
	})
}
util.inherits(Wirez,events.EventEmitter)

Wirez.prototype.log = log('Wirez')
Wirez.prototype.newLogger = function(name) {
	return log(name)
}

// set the path where to require the modules
Wirez.prototype.path = function(path){ this.wpath=path; return this }

// get the real path of a module, given its parent module
Wirez.prototype.realPath = function(mod,parentMod) {
	// don't rely on require.paths
	var parentModPath = parentMod ? path.dirname( parentMod.replace(this.wpath,'') ) : ''
	util.log('Parentmod: ' + parentMod + ', pmodpath: ' + parentModPath)
	return path.join(this.wpath,parentModPath,mod)
}
Wirez.prototype.requireAbsolute = function(mod) {
	mod = path.join( path.dirname(tmp),path.basename(tmp, '.js') )
	if(!this.wirezes[mod]) {
		this.deps.register(mod)
		this.wirezes[ mod ] = new WirezMod(this,mod)
		this.deps.register(mod,this.wirezes[ mod ])
		
		var s = this
		var m = this.wirezes[ mod ]
		m.on('starting',function(){s.deps.state.change( mod,'starting' ); s.emit('starting',m)})
		m.on('started',function(){s.deps.state.change( mod,'active' ); s.emit('active',m)})
		m.on('stopping',function(){s.deps.state.change( mod,'stopping' ); s.emit('stopping',m)})
		m.on('stopped',function(){s.deps.state.change( mod,'stopped' ); s.emit('stopped',m)})
		
		this.emit('installed',m)
	}
	return this.wirezes[ mod ].start()
}
Wirez.prototype.require = function(mod,parentMod) {
	if(!parentMod) {
		var tmp = misc.findParentModule()
		parentMod = path.join( path.dirname(tmp),path.basename(tmp,'.js') )
	}
	mod = this.realPath(mod,parentMod)
	log(parentMod + ' > ' + mod)
	if(!this.wirezes[mod]) {
		this.deps.register(mod)
		this.deps.depends(parentMod,mod)
		this.wirezes[ mod ] = new WirezMod(this,mod)
		this.deps.register(mod,this.wirezes[ mod ])
		
		var s = this
		var m = this.wirezes[ mod ]
		m.on('starting',function(){s.deps.state.change( mod,'starting' )})
		m.on('started',function(){s.deps.state.change( mod,'active' )})
		m.on('stopping',function(){s.deps.state.change( mod,'stopping' )})
		m.on('stopped',function(){s.deps.state.change( mod,'stopped' )})
	}
	return this.wirezes[ mod ].start()
}
Wirez.prototype.r = Wirez.prototype.require

Wirez.prototype.start = function(mod,parentMod) {
	mod = (parentMod) ? this.realPath(mod,parentMod) : mod
	if(!this.wirezes[mod]) return undefined
	return this.wirezes[ mod ].start()
}
Wirez.prototype.stop = function(mod,parentMod) {
	mod = (parentMod) ? this.realPath(mod,parentMod) : mod
	if(!this.wirezes[mod]) return
	this.wirezes[ mod ].stop()
}
Wirez.prototype.reload = function(mod,parentMod) {
	mod = (parentMod) ? this.realPath(mod,parentMod) : mod
	if(!this.wirezes[mod]) return undefined
	return this.wirezes[ mod ].reload()
}
Wirez.prototype.shutdown = function() {
	this.emit('shutdown',this)
	wu(this.wirezes).each(function(w){w.stop()})
}