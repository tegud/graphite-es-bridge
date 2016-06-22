const MetricBuffer = require('./metric-buffer');
const TcpServer = require('./tcp-server');
const HttpServer = require('./http-server');
const parsing = require('./parsing');
const events = require('./events');
const connectionTracker = require('./connection-tracker');
const missingMetrics = require('./missing-metrics');

function executeModuleHandler(moduleList, handler) {
    return moduleList.reduce((promises, current) => {
        if(!current[handler]) {
            return promises;
        }

        promises.push(current[handler]());

        return promises;
    }, []);
}

module.exports = function(config) {
    const metricBuffer = new MetricBuffer(config);
    const server = new TcpServer(config, data => parsing.processNewDataPacket(data));
    const http = new HttpServer(config);
    const serverModules = [events, connectionTracker, metricBuffer, server, missingMetrics, parsing, http];

    return {
        start: () => Promise.all(executeModuleHandler(serverModules, 'start'))
            .then(() => console.log('Graphite bridge startup completed.'))
            .catch(err => console.error(`Error starting graphite bridge: ${err}`)),
        stop: () => Promise.all(executeModuleHandler(serverModules, 'stop'))
    };
};
