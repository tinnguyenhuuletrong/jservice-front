var rabbit = require('../_config.js')

rabbit.send('schedule.create', {
	id: 1,
	delay: 60000 // 1 min
}).then(() => {
	rabbit.destroy()
});