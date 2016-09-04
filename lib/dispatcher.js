const _Common = require("./_common.js")
const pmx = require('pmx')

const Receiver = require("./receiver.js")
const JUtils = _Common.JUtils
const JBackbone = _Common.JBackbone

// Metric monitoring
const probe = pmx.probe();
const meter = probe.meter({
	name: 'req/sec',
	samples: 1,
	timeframe: 60
});

let API_MAP = {
	"default": "default",
}

var Dispatcher = function(request, response) {
	this.request = request
	this.response = response

	this.args = this.request.body
	if (this.isGet())
		this.args = this.request.query
	else if (this.isPost()) {
		//Stupid POST case
		if (Object.keys(this.request.body).length == 0 && Object.keys(this.request.query).length > 0)
			this.args = this.request.query
	} else {
		this.args = this.request.query
	}
};

Dispatcher.prototype.isGet = function() {
	return this.request.method === "GET";
}

Dispatcher.prototype.isPost = function() {
	return this.request.method === "POST";
}

Dispatcher.prototype.isSocketIO = function() {
	return this.request.method === "SOCKETIO";
}

Dispatcher.prototype.getArgs = function(key, defaultValue) {
	if (this.args[key] == null)
		return defaultValue
	return this.args[key]
}

Dispatcher.prototype.default = function() {
	var services = this.getArgs("service", null)
	var apiMode = this.getArgs("apiMode", "V1")
	if (services == null) {
		this.response.status(400);
		return this.response.send("OoO")
	}

	//Generate RequestID
	var id = JUtils.GenerateUID()
	var wids = "wk:" + services + ":" + id

	//Construct Header & Payload
	var header = {}
	header["api"] = this.request.path
	header["cip"] = this.request.ip

	var payload = this.args

	var response = this.response

	JBackbone.cacheSocket({
		type: "PUSH",
		opts: {},
		topic: services
	}).then(pushsock => {
		let res = pushsock.write(JSON.stringify({
			wids: wids,
			header: header,
			payload: payload
		}));

		if (!res) {
			response.status(500);
			return response.send("Publish channel failed")
		}

		//TTin Todo: Cache and estimate timeout insted of default 10s
		let maxWaitingTime = 10000

		//Waiting for worker reply
		Receiver.registerWaitingForWids(wids, {
			timeoutMs: maxWaitingTime
		}, (err, msg) => {
			// send data back to client
			if (err == null) {
				response.send(Object.assign({}, msg))

				// marked message as sent to client
				msg._sent = true
			} else {
				this.response.status(408);
				return this.response.send("Request TimeOut")
			}
		})
	})
}

//--------------------------------------------------------------------------------------//
//									Exports
//--------------------------------------------------------------------------------------//
module.exports.Handle = function(request, response) {
	meter.mark();

	var dispatcher = new Dispatcher(request, response)
	var api = request.path

	if (API_MAP[api] == null)
		dispatcher[API_MAP["default"]]()
	else
		dispatcher[API_MAP[api]]()
};