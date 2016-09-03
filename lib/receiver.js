const _CONFIG = require("../_config.js")
const _Common = require("./_common.js")
const EventEmitter = require('events');

const JUtils = _Common.JUtils
const JBackbone = _Common.JBackbone

const myEmitter = new EventEmitter();

let Database = {}

function onReceiverData(msg) {
	let wids = msg.wids

	if (Database[wids] != null) {
		Database[wids](null, msg)
		delete Database[wids]
	}

	// Emit Out Event
	myEmitter.emit("data", msg)
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
module.exports.registerWaitingForWids = function(wids, callback) {
	Database[wids] = callback
}