process.env.RMQ_CONNECTION_STRING = "amqp://guest:09031988@103.53.171.99:5672"

const Rabbitr = require('rabbitr');
const rabbit = new Rabbitr({
	url: process.env.RMQ_CONNECTION_STRING
});


module.exports = rabbit