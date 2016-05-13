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
        start: () => new Promise(resolve => resolve(scheduleNext())),
        stop: () => new Promise(resolve => resolve(clearTimeout(scheduleTimeout))),
        push: metric => {
            if(typeof metrics.forEach === 'function') {
                return metrics = metrics.concat(metric);
            }
            metrics.push(metric);
        }
    };
};
