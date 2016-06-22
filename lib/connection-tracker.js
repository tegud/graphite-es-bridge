const events = require('./events')

let openConnections;

module.exports = {
    start: () => {
        openConnections = {};
        events.on('open-connection', connection => openConnections[connection.from] = connection);
        events.on('close-connection', connection => delete openConnections[connection]);
    },
    getOpenConnections: () => Object.keys(openConnections).map(connectionKey => openConnections[connectionKey])
};
