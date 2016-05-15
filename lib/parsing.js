const moment = require('moment');
const _ = require('lodash');
const parsers = require('./parsers');
const events = require('./events');

function convertToMilliSeconds(timestampInSeconds) {
    return timestampInSeconds * 1000;
}

function parseMetricLine(metricLine) {
    const components = metricLine.split(' ');

    const key = parsers.parse(components[0]);

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

function processNewDataPacket(data) {
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

        events.emit('metric', metric);
    }
}

module.exports = {
    start: () => parsers.load(),
    processNewDataPacket: processNewDataPacket
}