var wu = require('wu').wu

module.exports.handle = function( wirez ) {
	return {response: wu(wirez.wirezes).mapply(
		function(path,w) {
			return w.name() + ' @' + w.state()
		}
	).toArray()}
}