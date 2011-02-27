module.exports.handle = function( wirez,modname ) {
	return {
		response: 'ok'
	, onSent: function() { wirez.shutdown(1000) }
	}
}