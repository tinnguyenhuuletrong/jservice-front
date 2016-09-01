var rabbit = require('../_config.js')

// in one module
rabbit.subscribe('sms.send.booking.create', {
	prefetch: 10
});
rabbit.bindExchangeToQueue('booking.create', 'sms.send.booking.create');
rabbit.on('sms.send.booking.create', function(message) {
	// send an sms
	console.log(process.pid, "send an sms", message.data)

	message.ack()
});

// in another module
rabbit.subscribe('email.send.booking.create', {
	prefetch: 3
});
rabbit.bindExchangeToQueue('booking.create', 'email.send.booking.create');
rabbit.on('email.send.booking.create', function(message) {
	// send an email
	console.log(process.pid, "send an email", message.data)

	// you can also return a promise
	message.ack()
});