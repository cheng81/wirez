var p = require('path')

var Bootstrap = module.exports = function(wirez) {
	this.wirez = wirez
}
Bootstrap.prototype.start = function( path ) {
	index = p.join((path||this.wirez.wpath),'index.js')
	this.wirez.requireAbsolute( index )
	//require( path||this.wirez.wpath )
}
