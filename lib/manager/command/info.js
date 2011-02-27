var wu = require('wu').wu

module.exports.handle = function( wirez,modname ) {
	if(modname) {
		var mod = wirez.getByName(modname)
		if(!mod) {
			return {response: 'Cannot find module '+modname, done:false}
		}
		var out = {}
		out.name = mod.name()
		out.path = mod.mod
		out.state = mod.state()
		out.dependencies = []
		wu( wirez.deps.dependencies(mod.mod) ).each(function(o) {
			var m = o[0]
			out.dependencies.push(m.name())
		})
		return {response: out}
	}
	
	var deps = wirez.deps
	var graph = deps.graph
	
	var out = {}
	out.dependencies = {}
	wu(graph.index).eachply(function(k,v){
		var n = k
		if(wirez.wirezes[k]){n=wirez.wirezes[k].name()}
		out.dependencies[n] = []
		wu( wirez.deps.dependencies(k) ).each(function(o) {
			var m = o[0]
			out.dependencies[n].push(m.name())
		})
	})
	return {response:out}
}