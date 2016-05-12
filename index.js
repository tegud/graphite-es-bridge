const net = require('net');
const MetricBuffer = require('./MetricBuffer')
const parsing = require('./parsing');

const port = 12003;

const metricBuffer = new MetricBuffer({
    elasticsearch: { host: '10.44.72.62:9200' }
});

net.createServer(socket => {
    socket.on('data', data => parsing.processNewDataPacket(data, metricData => metricBuffer.push(metricData)));
}).listen(port);

console.log(`Listening on port ${port}`);
