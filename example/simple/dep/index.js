var wirez = require('wirez')

var log = wirez.newLogger('dep/index')
module.exports = wirez.r('./d')

module.exports.wirezStart = function() {log('Starting')}
module.exports.wirezStop = function() {log('Stopping')}