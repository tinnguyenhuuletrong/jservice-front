const _Common = require("./_common.js")
const pmx = require('pmx')
const Receiver = require("./receiver.js")
const JUtils = _Common.JUtils
const Dispatcher = require("./dispatcher.js")

var probe = pmx.probe();
// The counter will start at 0 
var ccuCounter = probe.counter({
  name : 'CCU'
});

var SockerManager = function(io) {
	this.UserSocketMapping = {}
	this.io = io
}
module.exports = new SockerManager()

SockerManager.prototype.onConnection = function(socket) {
	var clientId = socket.id
	var clientIp = socket.request.connection.remoteAddress;

	//	CCU Counter
	ccuCounter.inc()

	socket.on("disconnect", () => {
		//	CCU Counter
		ccuCounter.dec()
		
		//Todo: remove UserSocketMapping and update user status directory
	})

	socket.on("request", (data) => {
		data = JUtils.ParseJsonString(data) || {}
		
		if (data.payload == null || data.path == null)
			return socket.emit("response", {
				status: 400,
				res: "Invalid data format"
			})

		Dispatcher.Handle(new SocketIORequest({
			query: data.payload,
			path: data.path,
			ip: clientIp
		}), new SocketIOResponse(socket))
	})

	socket.on("link", (data) => {
		data = JUtils.ParseJsonString(data) || {}
		//Todo: Link User ID with UserSocketMapping
	})
};

//--------------------------------------------------------------------------------------//
//									Internal Request
//--------------------------------------------------------------------------------------//
var SocketIORequest = function(options) {
	this.query = options.query
	this.method = "SOCKETIO"
	this.path = options.path
	this.ip = options.ip
}

var SocketIOResponse = function(socket) {
	this._stat = 200

	this.status = function(status) {
		this._stat = status
	}

	this.send = function(data) {
		socket.emit("response", {
			status: this._stat,
			res: data
		})
	}
}