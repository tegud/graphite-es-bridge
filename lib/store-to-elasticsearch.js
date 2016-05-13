const elasticsearch = require('elasticsearch');

module.exports = function ElasticsearchStore(config) {
    const client = new elasticsearch.Client(config);

    return {
        store: metrics => {
            client.bulk({
                body: metrics.reduce((bulkData, metric) => {
                    bulkData.push({ index: { _index: 'metrics-2016.05', _type: 'metric' } });
                    bulkData.push(metric);

                    return bulkData;
                }, [])
            })
            .catch(err => console.log(`Error storing to es: ${err}`));
        }
    };
}
