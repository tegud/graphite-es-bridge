const moment = require('moment');
const elasticsearch = require('elasticsearch');
const _ = require('lodash');

function MetricBuffer(config) {
    let metrics = [];
    const client = new elasticsearch.Client({
        host: config.elasticsearch.host
    });

    setTimeout(() => {
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
            .then(() => console.log(`${metricCount} metrics logged to ES`))
            .catch(err => console.log(`Error storing to es: ${err}`));

        metrics = [];
    }, config.pushEvery || 1000);

    return {
        push: metric => metrics.push(metric)
    };
};

function convertToMilliSeconds(timestampInSeconds) {
    return timestampInSeconds * 1000;
}

const metricBuffer = new MetricBuffer({
    elasticsearch: { host: '10.44.72.61:9200' }
});

var esNodeRegex = /^stats\.gauges\.elasticsearch\.(\w+)\.node\.(\w+_[^_]+_\w+)\.(.+)$/;
var esIndexRegex = /^stats\.gauges\.elasticsearch\.(\w+)\.index\.(\w+)\.(.+)$/;

function parseElasticsearchMetricKey(key) {
    var nodeMatch = esNodeRegex.exec(key)
    if (nodeMatch) {
        return {
            class: "elasticsearch",
            cluster: nodeMatch[1],
            node: nodeMatch[2],
            metric: nodeMatch[3]
        }
    }
    var indexMatch = esIndexRegex.exec(key)
    if (indexMatch) {
        return {
            class: "elasticsearch",
            cluster: indexMatch[1],
            index: indexMatch[2],
            metric: indexMatch[3]
        }
    }
    return;
}

function parseKafkaMetricKey(key) {
    return;
}

function parseMetricKey(key) {
    const lowerCasedkey = key.toLowerCase();
    const keyParts = key.split('.');
    if (lowerCasedkey.indexOf('elasticsearch') > -1) {
        return parseElasticsearchMetricKey(key, keyParts);
    } else if (lowerCasedkey.indexOf('kafka') > -1) {
        return parseKafkaMetricKey(key, keyParts);
    } else if (keyParts.length == 5) {
        return {
            class: keyParts[0],
            host: keyParts[1],
            group: keyParts[2],
            service: keyParts[3],
            metric: keyParts[4]
        };
    }

    return;
}

function parseMetricLine(metricLine) {
    const components = metricLine.split(' ');

    const key = parseMetricKey(components[0]);

    if (!key) {
        return;
    }

    const adjustedTime = convertToMilliSeconds(parseInt(components[2], 10));

    const metric = _.merge({
        '@timestamp': moment(adjustedTime).format(),
        value: components[1]
    }, key);

    return metric;
}

var buffer = "";

function processNewDataPacket(data) {
    const metricLines = data.toString('utf8');

    buffer += metricLines;

    while (buffer.indexOf('\n') > -1) {
        var lineEnd = buffer.indexOf('\n');
        var metricLine = buffer.substring(0, lineEnd);
        buffer = buffer.substring(lineEnd + 1);

        try {
            var metric = parseMetricLine(metricLine);
        } catch (e) {
            console.log(e);
        }
        if (!metric) {
            console.log(`Couldn't understand metric: "${metricLine}"`);
            continue;
        }

        // console.log(metric);
        // metricBuffer.push(metric);
    }
}

module.exports = {
    processNewDataPacket: processNewDataPacket
}
