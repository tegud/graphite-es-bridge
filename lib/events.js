const EventEmitter = require('events');

let eventEmitter;

module.exports = {
    start: () => new Promise(resolve => {
        eventEmitter = new EventEmitter();

        console.log('Event Listener initiated.');
        resolve();
    }),
    on: (event, handler) => eventEmitter.on(event, handler),
    emit: (event, data) => eventEmitter.emit(event, data)
};
