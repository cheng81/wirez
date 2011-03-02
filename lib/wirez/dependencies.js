var util = require('util')
  , wu   = require('wu').wu

  , Graph = require('./graph')

var merge = function(source, merge){
  for (var i in merge) source[i] = merge[i];
  return source;
}
var State = function(dep) {
	this.dep = dep
	this.states = {
		installed: 0
	, active: 1
	, stopped: 2
	, starting: 3
	, stopping: 4
	}
}
State.prototype.toStr = function(st) {
	var o  = 'unrecognized.'+st
	for(var i in this.states) {
		if(this.states[i]==st) {o=i; break}
	}
	return o
}
State.prototype.change = function(id,newState) {
	this.dep.graph.get(id).obj().state = this.states[newState]//this.states[ this.toStr(this.toStateInt(newState)) ]
}
State.prototype.toStateInt = function(st) {
	return this.states[st]
}
State.prototype.stateOf = function(id) {
	return this.dep.graph.get(id).obj().state
}
State.prototype.strstateOf = function(id) {
	return this.toStr( this.stateOf(id) )
}

var Dependencies = module.exports = function(rootId,rootObj) {
	this.graph = new Graph()
	this.state = new State(this)
	this.root = this.graph.newNode(rootId,{state: this.state.states.installed,obj:rootObj})
}

Dependencies.prototype.register = function(id,m) {
	if(!this.graph.get(id)) {
		this.graph.newNode(id,{state: this.state.states.installed,obj:m})
	} else {
		this.graph.get(id).obj().obj=m
	}
}
Dependencies.prototype.depends = function(from,to) {
	if(!this.graph.get(from)){this.register(from,undefined)}
	if(!this.graph.get(to)){this.register(to,undefined)}
	
	var fromNode = this.graph.get(from)
	if(!fromNode.hasLink(to)) {
		fromNode.link(to)
	}
}
Dependencies.prototype.dependOn = function(id) {
	return wu(this.graph.nodesTo(id)).map(function(n){return [n.obj().obj,n.id()]}).toArray()
}
Dependencies.prototype.dependencies = function(id) {
	return wu(this.graph.nodesFrom(id)).map(function(n){return [n.obj().obj,n.id()]}).toArray()
}

Dependencies.prototype.can = function(what,who) {
	var curState = this.state.stateOf(who)
	if(what=='start') {
		return (curState == this.state.states.stopped || curState == this.state.states.installed)
	} else if(what=='stop') {
		return (curState == this.state.states.active)
	}
}
Dependencies.prototype.strstateOf = function(id) {
	return this.state.strstateOf(id)
}

/*Dependencies.prototype.isActive = function(id) {
	return this.state.stateOf(id) == this.state.states.active
}
Dependencies.prototype.isStop = function(id) {
	return this.state.stateOf(id) == this.state.states.stopped
}
Dependencies.prototype.isStarting = function(id) {
	return this.state.stateOf(id) == this.state.states.starting
}
Dependencies.prototype.isStopping = function(id) {
	return this.state.stateOf(id) == this.state.states.stopping
}*/
