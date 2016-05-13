const net = require('net');
const MetricBuffer = require('./metric-buffer');
const parsing = require('./parsing');

module.exports = function(config) {
    const port = config.port || 12003;
    let server;

    return {
        start: () => new Promise(resolve => {
            const metricBuffer = new MetricBuffer(config);

            server = net.createServer(socket => {
                console.log('Socket open');
                socket.on('data', data => parsing.processNewDataPacket(data, metricData => metricBuffer.push(metricData)));
            });

            server.listen(port, () => {
                console.log(`Listening on port ${port}`);
                resolve();
            });
        }),
        stop: () => server.close()
    };
};
