const elasticsearch = require('elasticsearch');

module.exports = function MetricBuffer(config) {
    let metrics = [];
    const client = new elasticsearch.Client({
        host: config.elasticsearch.host
    });

    function sendMetrics() {
        setTimeout(() => {
            sendMetrics();
            const metricCount = metrics.length;

            if (!metricCount) {
                return console.log('No metrics to log.');
            }

            client.bulk({
                body: metrics.reduce((bulkData, metric) => {
                    bulkData.push({ index: { _index: 'metrics-2016.05', _type: 'metric' } });
                    bulkData.push(metric);

                    return bulkData;
                }, [])
            })
            .catch(err => console.log(`Error storing to es: ${err}`));

            metrics = [];
        }, config.pushEvery || 1000);
    }
    sendMetrics();

    return {
        push: metric => {
            metrics.push(metric);
        }
    };
};
