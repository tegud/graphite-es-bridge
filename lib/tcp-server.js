const net = require('net');
const Parser = require('./parsing').Parser;

module.exports = function TcpServer(config) {
    const port = config.port || 12003;
    const server = net.createServer(socket => {
        console.log(`Client Connected: ${socket.remoteAddress}`);
        const parser = new Parser();

        socket.on('data', data => parser.parse(data));
        socket.on('error', err => console.log(`Error with socket to ${socket.remoteAddress}: ${err}`);
        socket.on('end', () => console.log(`Client Session Ended: ${socket.remoteAddress}`));
        socket.on('close', hadErr => console.log(`Client Session Closed: ${socket.remoteAddress}, Due to Error ${(hadErr || false)}`));
    });

    return {
        start: () => new Promise(resolve => server.listen(port, () => {
            console.log(`Listening on port ${port}`);
            resolve();
        })),
        stop: () => server.close()
    };
}
