#!/usr/bin/env node
;(function () {
	var util  = require('util')
	  , wirez = require('wirez')
	  , path  = require('path')
	  , fs    = require('fs')
	  , wu    = require('wu').wu
	
	var args = process.argv
	args.shift()
	args.shift()

	var start = function( bootstrap,reloader,port ) {
		
		wirez.log('Start')
		wirez.bootstrap.start( process.cwd() )
		wirez.reloader.start()
		wirez.manager.start( process.cwd() )
		wirez.manager.addComm( 'tcp',port,'ascii' )
		wirez.log('Started')
	}
	
	var cli = function( port,args ) {
		var client = wirez.manager.getClient( 'tcp',port,'ascii',function(resp) {
			var response = resp.response
			if(response instanceof Array) {
				response = response.join('\n')
			} else if( typeof response == 'object' ) {
				var str = function(obj,tabs) {
					var prf = ''; for(var i=0;i<tabs;i++){prf=prf+'\t'}
					var tmp = []
					wu(obj).eachply(function(k,v){
						if( v instanceof Array ) { tmp.push(prf+k+': '+v.join(', ')) }
						else if( typeof v == 'object') {
							tmp.push(prf+k+': '); tmp.push( str(v,tabs+1) )
						}
						else { tmp.push(prf+k+': '+v)}
					})
					return tmp.join('\n')
				}
				var s = str(response,0)
				response = s
			}
			console.log(response)
			client.stop()
		} )
		client.RPC.apply(client,args)
	}
	
	if( args.length==0 ) {
		start(true,true, 'wirezmanager.unixdgram' )
	} else {
		cli('wirezmanager.unixdgram',args)
	}
	
	
})()