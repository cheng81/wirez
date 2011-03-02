var wirez = require('wirez')
  , b = wirez.r('./b')
  , dep = wirez.r('./dep')
  , log = wirez.newLogger('A')


// magic function, called when this module starts
module.exports.wirezStart = function() {
	log("Starting")
	
	dep.foo()
}
// other magic function!
module.exports.wirezStop = function() {
	log("Stopping")
}

log("Hello " + b.who)
b.change("Foo")
log("Hello " + b.who)
dep.foo()