var wirez = require('wirez')

var log = wirez.newLogger('dep/D')
module.exports.wirezStart = function() {
	log('starting...')
}
module.exports.wirezStop = function() {
	log('stopping...')
}
module.exports.foo = function() {
	log('Hello world')
}