var rabbit = require('../_config.js')

// elsewhere
setInterval(function() {
	rabbit.send('booking.create', {
		id: 1
	});
}, 10);