var path = require('path')

exports.findParentModule=function() {
	var args = arguments
	var it = 0
	while(it<10&&args!=undefined) {
		if(args["1"] && typeof args["1"] == 'function' && args["1"].name == 'require') {
			return args["3"]
		}
		args = (args&&args.callee&&args.callee.caller&&args.callee.caller.arguments) ? args.callee.caller.arguments : undefined
		it=it+1
	}
	return false
}