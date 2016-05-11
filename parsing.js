const moment = require('moment');
const _ = require('lodash');

function convertToMilliSeconds(timestampInSeconds) {
    return timestampInSeconds * 1000;
}

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

var kafkaRegex = /^stats\.gauges\.(\w+)\.topic\.lag\.(\w+)\.acquisitions_(?:live_)?(\w+)$/;

function parseKafkaMetricKey(key) {
    var match = kafkaRegex.exec(key);
    if(match) {
        return {
            class: "kafka-topic-lag",
            environment: match[1],
            application: match[2],
            topic: match[3]
        }
    }
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

function processNewDataPacket(data, callback) {
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

        callback(metric);
    }
}

module.exports = {
    processNewDataPacket: processNewDataPacket
}
