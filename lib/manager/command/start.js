var wu = require('wu').wu

module.exports.handle = function( wirez,modname ) {
	var mod = wirez.getByName(modname)
	if(!mod) {
		return {response: 'Cannot find module '+modname, done:false}
	}
	mod.start()
	return {response: mod.name() + ' @'+mod.state()}
}