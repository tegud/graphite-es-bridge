const elasticsearch = require('elasticsearch');
const moment = require('moment');

const patternMatchers = [
    { pattern: /\$\{YYYY\}/, format: 'YYYY' },
    { pattern: /\$\{MM\}/, format: 'MM' },
    { pattern: /\$\{DD\}/, format: 'DD' }
];

function buildIndex(pattern = 'metrics-${YYYY}.${MM}.${DD}') {
    const day = moment();

    return patternMatchers.reduce((current, matcher) => current.replace(matcher.pattern, day.format(matcher.format)), pattern);
}

module.exports = function ElasticsearchStore(config) {
    const client = new elasticsearch.Client(config);
    const document = {
        index: {
            _index: buildIndex(config.index), _type: config.type || 'metric'
        }
    };

    return {
        store: metrics => {
            client.bulk({
                body: metrics.reduce((bulkData, metric) => {
                    bulkData.push(document);
                    bulkData.push(metric);

                    return bulkData;
                }, [])
            })
            .then(() => console.log(`${metrics.length} metrics written to ES index ${document.index._index}, type:  ${document.index._type}` ))
            .catch(err => console.log(`Error storing to es: ${err}`));
        }
    };
}
