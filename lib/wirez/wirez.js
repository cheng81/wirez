var util   = require('util')
  , wu     = require('wu').wu
  , path   = require('path')
  , fs     = require('fs')
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
	, name: function(){return 'Wirez'}
	, state: function(){return 'active'}
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
	
	var parentModPath = parentMod ? parentMod : ''
	if(parentMod) {
		if( path.existsSync(parentMod + '.js') ) {
			parentModPath = path.dirname(parentModPath)
		}
	}
	parentModPath = parentModPath.replace(this.wpath,'')
	
	//var parentModPath = parentMod ? path.dirname( parentMod.replace(this.wpath,'') ) : ''
	//this.log('Parentmod: ' + parentMod + ', pmodpath: ' + parentModPath)
	return path.join(this.wpath,parentModPath,mod)
}
Wirez.prototype.requireAbsolute = function(tmp) {
	mod = path.join( path.dirname(tmp),path.basename(tmp, '.js') )
	if(!this.wirezes[mod]) {
		this.log('Installing module '+mod)
		this.wirezes[ mod ] = new WirezMod(this,mod)
		this.deps.register(mod,this.wirezes[ mod ])
		
		var s = this
		var m = this.wirezes[ mod ]
		m.on('starting',function(_m){s.emit('starting',_m)})
		m.on('active',function(_m){s.emit('active',_m)})
		m.on('stopping',function(_m){s.emit('stopping',_m)})
		m.on('stopped',function(_m){s.emit('stopped',_m)})
		
		this.emit('installed',m)
	}
	return this.wirezes[ mod ].start()
}
Wirez.prototype.require = function(mod,parentMod) {
	this.log("Requiring " + mod)
	if(!parentMod) {
		var tmp = misc.findParentModule()
		parentMod = path.join( path.dirname(tmp),path.basename(tmp,'.js') )
		if(!this.wirezes[parentMod]) {
			var parentparentMod = path.dirname(parentMod)
			this.log(parentMod + ' not installed, try to resolve '+parentparentMod)
			var parentparent = this.getByPath(parentparentMod)
			if(parentparent) {
				this.log('found parentparent')
				this.require(parentMod.replace(parentparentMod,'.'),parentparentMod)
			} else {
				this.log('not found!')
			}
		}
	}
	mod = this.realPath(mod,parentMod)
	this.log(parentMod + ' > ' + mod)
	if(!this.wirezes[mod]) {
		this.deps.register(mod)
		this.deps.depends(parentMod,mod)
		this.wirezes[ mod ] = new WirezMod(this,mod)
		this.deps.register(mod,this.wirezes[ mod ])
		
		var s = this
		var m = this.wirezes[ mod ]
		m.on('starting',function(_m){s.emit('starting',_m)})
		m.on('active',function(_m){s.emit('active',_m)})
		m.on('stopping',function(_m){s.emit('stopping',_m)})
		m.on('stopped',function(_m){s.emit('stopped',_m)})

		this.emit('installed',m)
	} else {
		this.deps.depends(parentMod,mod)
	}
	return this.wirezes[ mod ].start()
}
Wirez.prototype.r = function(mod,parentMod) {
	return this.require(mod,parentMod)
}

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
Wirez.prototype.shutdown = function(timeout) {
	if(timeout) {
		var s=this
		setTimeout(function(){s.shutdown()},timeout)
	}
	this.emit('shutdown',this)
	wu(this.wirezes).each(function(w){w[1].stop()})
}

Wirez.prototype.getByPath = function(path) {
	var ar = wu(this.wirezes).filter(function(mod){ return mod[1].mod==path }).toArray()
	if(ar.length>0) {
		return ar[0][1]
	} else {
		this.log('Cannot find module '+name)
		return false
	}
}
Wirez.prototype.getByName = function(name) {
	var ar = wu(this.wirezes).filter(function(mod){ return mod[1].name()==name }).toArray()
	if(ar.length>0) {
		return ar[0][1]
	} else {
		this.log('Cannot find module '+name)
		return false
	}
}