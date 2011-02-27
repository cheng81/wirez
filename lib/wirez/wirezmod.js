var events = require('events')
  , util   = require('util')
  , path   = require('path')

  , wu = require('wu').wu

var WirezMod = module.exports = function(w,mod) {
	events.EventEmitter.call(this)
	
	this.wirez = function(){return w}
	this.mod = mod
	this.cached = undefined
}
util.inherits(WirezMod,events.EventEmitter)

WirezMod.prototype.name = function() {
	var n =  this.mod.substring( this.wirez().wpath.length )
	if(n[0]=='/') {n=n.substring(1)}
	return path.join( path.dirname(n), path.basename(n,'.js') )
}
WirezMod.prototype.state = function() {
	return this.wirez().deps.strstateOf(this.mod)
}

WirezMod.prototype._state = function(newState) {
	this.wirez().log('Change state of '+this.mod+' to '+newState)
	this.wirez().deps.state.change( this.mod,newState )
	this.emit(newState,this)
}

/*
if starting/started, do nothing
else
	emit starting
	if !cached, load
	for each dependency, recurse on start
	call module wirezStart function, if any
	emit started
return cached
*/
WirezMod.prototype.start = function() {
	if(this.wirez().deps.can('start',this.mod)) {
		//this.emit('starting',this)
		this._state('starting')
		
		if(!this.cached){this.cached=require(this.mod)}
		wu(this.wirez().deps.dependencies(this.mod)).each(function(dep){
			if(dep[0]) {
				dep[0].start()
			}
		})
		if(this.cached.wirezStart){this.cached.wirezStart()}
		//this.emit('started',this)
		this._state('active')
	}
	return this.cached
}
/*
if stopping/stopped, do nothing
else
	emit stopping
	for each dependent module, recurse on stop
	call module wirezStop function, if any
	remove cache reference
	emit stopped
*/
WirezMod.prototype.stop = function() {
	if(this.wirez().deps.can('stop',this.mod)) {
		this.wirez().log('stopping '+this.mod)
		//this.emit('stopping',this)
		this._state('stopping')
		wu(this.wirez().deps.dependOn(this.mod)).each(function(dep){
			if(dep[0]) {
				this.wirez().log('stopping '+this.mod+', requires stop '+dep[0].mod)
				dep[0].stop()
			}
		},this)
		if(this.cached&&this.cached.wirezStop){this.cached.wirezStop()}
		this.cached = undefined
		//this.emit('stopped',this)
		this._state('stopped')
	}
}
/*
store started dependent modules
stop/start
start stored dependent modules
return cached
*/
WirezMod.prototype.reload = function() {
	this.wirez().log('reloading ' + this.mod)
	var s=this
	var dependentStarted = wu(this.wirez().deps.dependOn(this.mod)).filter( function(d){
		if(!d[0]) return false
		var state = s.wirez().deps.strstateOf(d[0].mod)
		//s.wirez().log('State of '+d[0].mod+' > '+state)
		return (state == 'active')
	} ).toArray()
	this.stop()
	this.start()
	//this.wirez().log('reload '+this.mod+'completed, restart dependent')
	wu(dependentStarted).each(function(d){
		s.wirez().log('restarting ' + d[0].mod + '...')
		d[0].start()
	})
	this.wirez().log('reload completed.')
	return this.cached
}