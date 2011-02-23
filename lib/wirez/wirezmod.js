var events = require('events')
  , util   = require('util')

  , wu = require('wu').wu

var WirezMod = module.exports = function(w,mod,depnode) {
	events.EventEmitter.call(this)
	
	this.wirez = function(){return w}
	this.mod = mod
	this.node = depnode
	this.cached = undefined
}
util.inherits(WirezMod,events.EventEmitter)

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
		this.emit('starting',this)
		if(!this.cached){this.cached=require(this.mod)}
		wu(this.wirez().deps.dependencies(this.mod)).each(function(dep){
			if(dep[0]) {
				dep[0].start()
			}
		})
		if(this.cached.wirezStart){this.cached.wirezStart()}
		this.emit('started',this)
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
		util.log('stopping '+this.mod)
		this.emit('stopping',this)
		wu(this.wirez().deps.dependOn(this.mod)).each(function(dep){
			if(dep[0]) {
				util.log('stopping '+this.mod+', requires stop '+dep[0].mod)
				dep[0].stop()
			}
		},this)
		if(this.cached.wirezStop){this.cached.wirezStop()}
		this.cached = undefined
		this.emit('stopped',this)
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