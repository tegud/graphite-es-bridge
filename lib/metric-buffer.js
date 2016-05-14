const events = require('./events');
const ElasticsearchStore = require('./store-to-elasticsearch');

module.exports = function MetricBuffer(config) {
    let metrics = [];
    let scheduleTimeout;
    const store = new ElasticsearchStore(config.elasticsearch);

    function sendMetrics() {
        scheduleNext();

        const metricCount = metrics.length;

        if (!metricCount) {
            return console.log('No metrics to log.');
        }

        store.store(metrics);

        metrics = [];
    }

    function scheduleNext() {
        scheduleTimeout = setTimeout(sendMetrics, config.pushEvery || 1000);
    }

    return {
        start: () => new Promise(resolve => {
            events.on('metric', metric => metrics.push(metric));
            scheduleNext();
            resolve();
        }),
        stop: () => new Promise(resolve => resolve(clearTimeout(scheduleTimeout)))
    };
};
