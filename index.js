const net = require('net');
const parsing = require('./parsing');

const port = 12003;

net.createServer(socket => {
    socket.on('data', parsing.processNewDataPacket)
}).listen(port);

console.log(`Listening on port ${port}`);
