var util = require('util')
  , path = require('path')
  , fs   = require('fs')
  , wu   = require('wu').wu

  , misc = require('./misc')

var Reloader = module.exports = function(wirez) {
	this.wirez = wirez
	this.watches = {}
}
Reloader.prototype.start = function() {
	this.wirez.log("Starting reloader")
	var s=this
	wu(this.wirez.wirezes).each(function(wirezmod) {
		this._startWatch(wirezmod[1])
	},this)
	this.wirez.on('installed', function(mod){s._startWatch(mod)})
}

Reloader.prototype._startWatch = function(wmod) {
	var s=this
	path.exists( wmod.mod+'.js', function(exists) {
		if( exists ) {
			s.wirez.log('Watching file: '+wmod.mod+'.js')
			// watching file
			fs.watchFile( wmod.mod+'.js',function(c,p) {
				if(c.mtime.getTime() === p.mtime.getTime()) { return }
//				s.wirez.log('>>> reload ' + wmod.mod + ', ' + c.mtime + '!=' + p.mtime)
//				s.wirez.log(util.inspect(c))
				//remove cache
				misc.deleteCache(wmod.mod+'.js')
				//reload
				s.wirez.reload(wmod.mod)
			} )
		} else {
			s.wirez.log("File " + wmod.mod + ".js not found!")
		}
	} )
}


Reloader.prototype._start = function(path) {
	var s = this
	
	var diff = function(files1,files2) {
		return files1.filter( function(f1){ return files2.all(function(f2){ return f1 != f2 }) } ).toArray()
	}
	var callback = function(stats,file,innerModule,files) {
		if(s.watches[file]) {
			return
		}
		
		var watch = undefined
		if(!stats.isDirectory()) {
			util.log('watching '+file+ ( (innerModule)?(' in module '+innerModule):('') ) )
			var wirezmodname = path.join( path.dirname(file),path.basename(file,'.js') )
			watch = function(c,p) {
				if(c.mtime != p.mtime) {
					util.log('>>> reload ' + file)
					//remove cache
					misc.deleteCache(file)
					//reload
					s.wirez.reload(wirezmodname)

					if(innerModule) {
						util.log('>>> reload inner module '+innerModule)
						s.wirez.reload(innerModule)
					}
				}
			}
		} else {
			util.log('Watching dir for delete/added files ' + file)
			watch = function(c,p) {
				if(c.mtime != p.mtime) {
					fs.readdir(file, function(err, fileNames) {
						if(err) {
							util.log('cannot reading files ' + dir)
							return
						}
						
						var added = diff(wu(files),wu(fileNames))
						var removed = diff(wu(fileNames),wu(files))
						
						if(added.length==0 && removed.length==0){return}
						
						util.log('>>>>> directory '+file)
						files = wu(files).filter(function(f1){return wu(removed).any(function(f2){return f1==f2})})
						wu(added).each(function(f){files.push(f)})
						
						wu(added).each(function(f){
							s.wirez.requireAbsolute(path.join(file,f))
							if( fs.statSync(f).isDirectory() ) {
								misc.findAllWatchFiles(path.join(file,f),innerModule,callback)
							}
						})
						wu(removed).each(function(f){
							s.wirez.stop(path.join(file,f))
							delete (s.watches[path.join(file,f)])
							//if is a dir, the single-file callback should be called, right?
						})
					})
				}
			}
		}
		s.watches[file] = 1
		fs.watchFile(file,watch)
	}
	misc.findAllWatchFiles( path||this.wirez.wpath,undefined,callback )
	
	/*var callback = function(name,stat) {
		util.log('watching '+name)
		return function(c,p) {
			if(c.mtime != p.mtime) {
				util.log(name + ' changed ' + stat.isDirectory())
				if(stat.isDirectory() {
					// uhm...
				})
			}
		}
	}*/
}