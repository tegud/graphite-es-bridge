const net = require('net');
const parsing = require('./parsing');

const port = 12003;

net.createServer(socket => {
    var buffer = "";
    socket.on('data', data => {
        parsing.processNewDataPacket(data);
    });
}).listen(port);

console.log(`Listening on port ${port}`);
