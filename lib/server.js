const MetricBuffer = require('./metric-buffer');
const TcpServer = require('./tcp-server');
const parsing = require('./parsing');

module.exports = function(config) {
    const metricBuffer = new MetricBuffer(config);
    const server = new TcpServer(config, data => parsing.processNewDataPacket(data, metricData => metricBuffer.push(metricData)));

    const serverModules = [metricBuffer, server];

    return {
        start: () => Promise.all(serverModules.map(module => module.start())),
        stop: () => Promise.all(serverModules.map(module => module.stop()))
    };
};
