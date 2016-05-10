const net = require('net');
const moment = require('moment');
const elasticsearch = require('elasticsearch');
const _ = require('lodash');

const port = 12003;

function parseMetricKey(key) {
    const keyParts = key.split('.');

    if(keyParts.length !== 5) {
        return;
    }

    return {
        class: keyParts[0],
        host: keyParts[1],
        group: keyParts[2],
        service: keyParts[3],
        metric: keyParts[4]
    };
}

function MetricBuffer(config) {
    let metrics = [];
    const client = new elasticsearch.Client({
        host: config.elasticsearch.host
    });

    setTimeout(() => {
        const metricCount = metrics.length;

        if(!metricCount) {
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

const metricBuffer = new MetricBuffer({
    elasticsearch: { host: '10.44.72.61:9200' }
});

net.createServer(socket => {
    var buffer = "";
    socket.on('data', data => {
        const metricLines = data.toString('utf8');

        buffer += metricLines;
        while (buffer.indexOf('\n') > -1) {
            var lineEnd = buffer.indexOf('\n');
            var metricLine = buffer.substring(0, lineEnd);
            buffer = buffer.substring(lineEnd + 1);

            const components = metricLine.split(' ');

            if(components.length < 3) {
                return console.log(`Split metric line: ${metricLine}`);
            }

            const key = parseMetricKey(components[0]);

            if(!key) {
                return console.log(`Couldn't understand key: "${components[0]}"`)
            }

            const adjustedTime = parseInt(components[2], 10) * 1000;

            const metric = _.merge({
                '@timestamp': moment(adjustedTime).format(),
                value: components[1]
            }, key);
            console.log(metric)

            // metricBuffer.push(metric);
        }
    });
}).listen(port);

console.log(`Listening on port ${port}`);
