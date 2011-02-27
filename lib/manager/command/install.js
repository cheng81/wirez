var path = require('path')

module.exports.handle = function( wirez,modpath ) {
	if(modpath[0]!='/') { modpath = path.join( wirez.wpath,modpath ) }
	wirez.requireAbsolute(modpath)
	return {response: 'ok'}
}