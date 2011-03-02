var path = require('path')

module.exports.handle = function( wirez,modname ) {
	mod = wirez.getByName(modname)
	if(!mod) { return {response: 'Cannot find module '+mod, done:false} }
	
	mod.reload()
	
	return {response: 'ok'}
}