const EventEmitter = require('events');

let eventEmitter;

module.exports = {
    start: () => new Promise(resolve => {
        eventEmitter = new EventEmitter();
        resolve();
    }),
    on: (event, handler) => eventEmitter.on(event, handler),
    emit: (event, data) => eventEmitter.emit(event, data)
};
