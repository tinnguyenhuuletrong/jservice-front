var commonConfig = {}
commonConfig.RABBITMQ_CONNECTION = "amqp://guest:09031988@103.53.171.99:5672"

commonConfig.HTTP_Enable = true
commonConfig.SSL_Enable = false
commonConfig.SOCKETIO_Enable = true

commonConfig.HTTP_PORT = 42344
commonConfig.HTTPS_PORT = 443
commonConfig.SOCKETIO_PORT = 3000

module.exports = commonConfig

//---------------
// Override Global Function
//---------------
if (commonConfig.ConsoleLogEnable === 0)
	console.log = function() {}