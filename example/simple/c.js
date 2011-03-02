var wirez = require('wirez')
  , b     = wirez.r('./b')
  , log   = wirez.newLogger('C')

module.exports.wirezStart = function() {log("Starting")}
module.exports.wirezStop = function() {log("Stopping")}

log("Hello from module 'c', " + b.who)
