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
        else {
            console.log(`${metricCount} metrics to store.`);
        }

        store.store(metrics);

        metrics = [];
    }

    function scheduleNext() {
        const nextRefreshIn = config.pushEvery || 1000;
        console.log(`Scheduling next metric push for ${nextRefreshIn}`);
        scheduleTimeout = setTimeout(sendMetrics, nextRefreshIn);
    }

    return {
        start: () => new Promise(resolve => {
            events.on('metric', metric => metrics.push(metric));
            scheduleNext();

            console.log('Metric Buffer initiated.');
            resolve();
        }),
        stop: () => new Promise(resolve => resolve(clearTimeout(scheduleTimeout)))
    };
};
