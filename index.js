var Wirez     = require('./lib/wirez').Wirez
var Reloader  = require('./lib/reloader').Reloader
var Bootstrap = require('./lib/bootstrap').Bootstrap

module.exports = new Wirez()
module.exports.reloader = new Reloader(module.exports)
module.exports.bootstrap = new Bootstrap(module.exports)