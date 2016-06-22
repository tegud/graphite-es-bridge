const net = require('net');
const Parser = require('./parsing').Parser;
const events = require('./events');

module.exports = function TcpServer(config) {
    const port = config.port || 12003;
    const server = net.createServer(socket => {
        console.log(`Client Connected: ${socket.remoteAddress}`);
        let parser = new Parser();
        events.emit('open-connection', { from: socket.remoteAddress, to: port });

        socket.on('data', data => parser.parse(data));
        socket.on('error', err => console.log(`Error with socket to ${socket.remoteAddress}: ${err}`));
        socket.on('end', () => {
            events.emit('close-connection', socket.remoteAddress);
            parser = undefined;
        });
    });

    return {
        start: () => new Promise(resolve => server.listen(port, () => {
            console.log(`Listening on port ${port}`);
            resolve();
        })),
        stop: () => server.close()
    };
}
