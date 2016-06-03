const elasticsearch = require('elasticsearch');
const moment = require('moment');

const patternMatchers = [
    { pattern: /\$\{YYYY\}/, format: 'YYYY' },
    { pattern: /\$\{MM\}/, format: 'MM' },
    { pattern: /\$\{DD\}/, format: 'DD' }
];

function buildIndex(pattern = 'metrics-${YYYY}.${MM}') {
    const day = moment();

    return patternMatchers.reduce((current, matcher) => current.replace(matcher.pattern, day.format(matcher.format)), pattern);
}

module.exports = function ElasticsearchStore(config) {
    const client = new elasticsearch.Client(config);

    return {
        store: metrics => {
            client.bulk({
                body: metrics.reduce((bulkData, metric) => {
                    bulkData.push({
                        index: {
                            _index: buildIndex(config.index), _type: config.type || 'metric'
                        }
                    });
                    bulkData.push(metric);

                    return bulkData;
                }, [])
            })
            .catch(err => console.log(`Error storing to es: ${err}`));
        }
    };
}
