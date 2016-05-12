const moment = require('moment');
const _ = require('lodash');
const parse = require('./parsers')();

function convertToMilliSeconds(timestampInSeconds) {
    return timestampInSeconds * 1000;
}

function parseMetricKey(key) {
    const lowerCasedkey = key.toLowerCase();
    const keyParts = key.split('.');
    if (lowerCasedkey.indexOf('elasticsearch') > -1) {
        return parse.elasticsearch(key, keyParts);
    } else if (lowerCasedkey.indexOf('topic.lag') > -1) {
        return parse.kafkaTopicLag(key, keyParts);
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
        value: parseFloat(components[1])
    }, key);

    return metric;
}

let buffer = "";

function processNewDataPacket(data, callback) {
    const metricLines = data.toString('utf8');

    buffer += metricLines;

    while (buffer.indexOf('\n') > -1) {
        const lineEnd = buffer.indexOf('\n');
        const metricLine = buffer.substring(0, lineEnd);
        let metric;

        buffer = buffer.substring(lineEnd + 1);

        try {
            metric = parseMetricLine(metricLine);
        } catch (e) {
            console.log(e);
        }
        if (!metric) {
            // console.dir(`Couldn't understand metric: "${metricLine}"`);
            continue;
        }

        callback(metric);
    }
}

module.exports = {
    processNewDataPacket: processNewDataPacket
}
