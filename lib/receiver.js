const _CONFIG = require("../_config.js")
const _Common = require("./_common.js")
const EventEmitter = require('events');
const JUtils = _Common.JUtils
const JBackbone = _Common.JBackbone

const DEFAULT_TIMEOUT_MS = 10000

const myEmitter = new EventEmitter();
let Database = {}

function onReceiverData(msg) {
	let wids = msg.wids

	if (Database[wids] != null) {
		if (Database[wids].callback != null)
			Database[wids].callback(null, msg)

		//Clear Timeout
		clearTimeout(Database[wids]._timeoutTicket)

		delete Database[wids]
	}

	// Emit Out Event
	myEmitter.emit("data", msg)
}

function onTimeoutWids(wids) {

	//Delete Timeout Msg
	if (Database[wids] != null) {
		if (Database[wids].callback != null)
			Database[wids].callback(408, null)
		delete Database[wids]
	}
}

JBackbone.createSock("SUB").then(sub => {
	sub.setEncoding('utf8');
	sub.connect('frontapi.out', function() {
		sub.on("data", (msg) => {
			let data = JUtils.ParseJsonString(msg)
			if (data != null)
				onReceiverData(data)
		});
	});
})

module.exports.Emitter = myEmitter
module.exports.registerWaitingForWids = function(wids, options, callback) {
	let timeoutMS = options.timeoutMs || DEFAULT_TIMEOUT_MS

	Database[wids] = {
		callback: callback,
		_timeoutTicket: setTimeout(function() {
			onTimeoutWids(wids)
		}, timeoutMS)
	}
}