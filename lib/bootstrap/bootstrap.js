

var Bootstrap = module.exports = function(wirez) {
	this.wirez = wirez
}
Bootstrap.prototype.start = function( path ) {
	require( path||this.wirez.wpath )
}
