const net = require('net');

module.exports = function TcpServer(config, handler) {
    const port = config.port || 12003;
    const server = net.createServer(socket => {
        console.log(`Client Connected: ${socket.remoteAddress}`);
        socket.on('data', data => handler(data));
    });

    return {
        start: () => new Promise(resolve => server.listen(port, () => {
            console.log(`Listening on port ${port}`);
            resolve();
        })),
        stop: () => server.close()
    };
}
