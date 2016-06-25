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

function getConfiguredPorts(config) {
    if(!config.port) {
        return [12003];
    }

    if(typeof config.port === 'object') {
        return config.port
    }

    return [config.port];
}

module.exports = function(config) {
    const metricBuffer = new MetricBuffer(config);
    const tcpServers = getConfiguredPorts(config).map(port => new TcpServer(config, port, data => parsing.processNewDataPacket(data)));
    const http = new HttpServer(config);
    const serverModules = [events, connectionTracker, metricBuffer, ...tcpServers, missingMetrics, parsing, http];

    return {
        start: () => Promise.all(executeModuleHandler(serverModules, 'start'))
            .then(() => console.log('Graphite bridge startup completed.'))
            .catch(err => console.error(`Error starting graphite bridge: ${err}`)),
        stop: () => Promise.all(executeModuleHandler(serverModules, 'stop'))
    };
};
