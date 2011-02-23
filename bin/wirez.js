#!/usr/bin/env node
;(function () {
	var util  = require('util')
	  , wirez = require('wirez')

	wirez.log('Start')
	wirez.bootstrap.start( process.cwd() )
	wirez.reloader.start()
	wirez.log('Started')
})()