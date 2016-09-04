var _CONFIG = require("./_config.js")

var http = require('http'),
	express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	compress = require('compression')

var https = require('https');

var Dispatcher = require('./lib/dispatcher.js')
var SocketManager = require('./lib/socketmanager.js')

var app = express();

app.use(compress()); // for supporting gzip
app.use(bodyParser.json({
	limit: '5mb'
})); // for parsing application/json
app.use(bodyParser.urlencoded({
	limit: '5mb',
	extended: true
})); // for parsing application/x-www-form-urlencoded

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

// Begin processEnviroment 
for (var i = 0; i < process.argv.length; i++) {
	var key = process.argv[i]
	if (key == "-httpport")
		_CONFIG.HTTP_PORT = parseInt(process.argv[i + 1])

	if (key == "-httpsport")
		_CONFIG.HTTPS_PORT = parseInt(process.argv[i + 1])

	if (key == "-socketioport")
		_CONFIG.SOCKETIO_PORT = parseInt(process.argv[i + 1])
};

if (process.env.RABBITMQ == null)
	process.env.RABBITMQ = _CONFIG.RABBITMQ_CONNECTION

//--------------------------------------------------------------------------------------//
//									Set Variables
//--------------------------------------------------------------------------------------//
app.set('port', _CONFIG.HTTP_PORT);

//--------------------------------------------------------------------------------------//
//									Handle POST
//--------------------------------------------------------------------------------------//
app.post('/*', function(req, res) {
	Dispatcher.Handle(req, res);
});


//--------------------------------------------------------------------------------------//
//									Handle GET
//--------------------------------------------------------------------------------------//
app.get('/*', function(req, res) {
	Dispatcher.Handle(req, res);
});


//--------------------------------------------------------------------------------------//
//									Start Server HTTP
//--------------------------------------------------------------------------------------//
if (_CONFIG.HTTP_Enable) {
	http.createServer(app).listen(app.get('port'), function() {
		console.log('[FrontAPI] Http Express server listening on port ' + app.get('port'));
	});
}

//--------------------------------------------------------------------------------------//
//									Start Server HTTPS
//--------------------------------------------------------------------------------------//

if (_CONFIG.SSL_Enable) {
	let fs = require('fs')
	let privateKey = fs.readFileSync('./ssl/' + _CONFIG.SSL_PrivateKey, 'utf8');
	let certificate = fs.readFileSync('./ssl/' + _CONFIG.SSL_Certificate, 'utf8');
	let ca = fs.readFileSync('./ssl/' + _CONFIG.SSL_PublishCA, 'utf8');

	let credentials = {
		key: privateKey,
		cert: certificate,
		ca: ca
	};

	https.createServer(credentials, app).listen(process.env.HTTPS_PORT, function() {
		console.log('[FrontAPI] Https Express server listening on port ' + process.env.HTTPS_PORT);
	});
}

//--------------------------------------------------------------------------------------//
//									Start Server SocketIO
//--------------------------------------------------------------------------------------//

if (_CONFIG.SOCKETIO_Enable) {
	let server = require('http').createServer();
	let io = require('socket.io')(server);
	io.on('connection', function(socket) {
		SocketManager.onConnection(socket)
	});
	server.listen(_CONFIG.SOCKETIO_PORT, function() {
		console.log('[FrontAPI] SocketIO server listening on port ' + _CONFIG.SOCKETIO_PORT);
	});
}