var util = require('util')
  , wu   = require('wu').wu
  , fs   = require('fs')
  , path = require('path')

exports.deleteCache = function(modname) {
	if(!require.cache[modname]) {util.log('cannot find ' + modname + ' in cache')}
	delete (require.cache[modname])
}

var fileExtensionPattern = new RegExp(".*\.(js)")
var findAllWatchFiles = function(dir,innerModule,callback) {
//	util.log('fawf ' + dir + ', ' + innerModule + ' ' + util.inspect(callback))
	fs.stat(dir,function(err,stats){
		if(err) {
			util.log('cannot retrieve stats for file ' + dir)
			return
		}
		if(stats.isDirectory()) {
			innerModule=undefined
			fs.readdir(dir, function(err, fileNames) {
				if(err) {
					util.log('cannot reading files ' + dir)
					return
				}
				util.log(util.inspect(fileNames))
				if(wu(fileNames).any(function(f){return f=='index.js'})) {
					//wrap a module too
					//callback(dir,stats)
					innerModule = dir
				}
				//callback(stats,dir,innerModule,fileNames)
				wu(fileNames).each(function(fileName) {
					findAllWatchFiles( path.join(dir,fileName),innerModule,callback)
				} )
			})
		} else {
			if(dir.match(fileExtensionPattern)) {
				callback(stats,dir,innerModule)
			}
		}
	})
}
exports.findAllWatchFiles = findAllWatchFiles