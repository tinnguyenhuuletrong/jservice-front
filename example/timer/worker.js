var rabbit = require('../_config.js')

// set timer
rabbit.subscribe('schedule.timer.set');
rabbit.bindExchangeToQueue('schedule.create', 'schedule.timer.set');
rabbit.on('schedule.timer.set', message => {
	// do something to calculate how long we want the timer to last
	var timeFromNow = message.data.delay;

	console.log("schedule timer ", message.data.id, timeFromNow)
	rabbit.setTimer('schedule.fire', message.data.id, {
		id: message.data.id,
	}, timeFromNow);

	message.ack()
});

// clear timer if something has happened that means the timer action isn't required
rabbit.subscribe('schedule.timer.clear');
rabbit.bindExchangeToQueue('schedule.clear', 'schedule.timer.clear');
rabbit.on('schedule.timer.clear', message => {

	console.log("schedule clear ", message.data.id)

	rabbit.clearTimer('schedule.timer.fire', message.data.id);

	message.ack()
});

// handle the timer firing
rabbit.subscribe('schedule.timer.fire');
rabbit.bindExchangeToQueue('schedule.fire', 'schedule.timer.fire');
rabbit.on('schedule.timer.fire', message => {

	console.log("schedule exe ", message.data.id)

	message.ack()

	// do something off the back of the timer firing
	// in this example, message.data.id is the booking id that wasn't confirmed in time
	//return Promise.resolve(); // optional
});