var util = require('util')
  , path = require('path')
  , fs   = require('fs')
  , wu   = require('wu').wu

  , misc = require('./misc')

var Reloader = module.exports = function(wirez) {
	this.wirez = wirez
	this.watches = []
	this.log = wirez.newLogger('Wirez.Reloader')
}
Reloader.prototype.start = function() {
	//this.wirez.log("Starting reloader")
	this.log('Starting')
	var s=this
	wu(this.wirez.wirezes).each(function(wirezmod) {
		this._startWatch(wirezmod[1])
	},this)
	this.wirez.on('installed', function(mod){s._startWatch(mod)})
	this.wirez.on('shutdown', function(){
		s.log('Shutting down')
		wu(s.watches).each(function(w){fs.unwatchFile(w)})
	})
}

Reloader.prototype._startWatch = function(wmod) {
	var s=this
	var file = wmod.mod+'.js'
	path.exists( file, function(exists) {
		if( exists ) {
			s.log('Watching file: '+file)
			s.watches.push(file)
			// watching file
			fs.watchFile( file,function(c,p) {
				if(c.mtime.getTime() === p.mtime.getTime()) { return }
//				s.wirez.log('>>> reload ' + wmod.mod + ', ' + c.mtime + '!=' + p.mtime)
//				s.wirez.log(util.inspect(c))
				//remove cache
				//misc.deleteCache(file)
				//reload
				//s.wirez.reload(wmod.mod)
				wmod.hotReload()
			} )
		} else {
			s.log("File " + file + " not found!")
		}
	} )
}