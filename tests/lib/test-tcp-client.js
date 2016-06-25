const net = require('net');

module.exports = function TestClient(ip = '127.0.0.1', port = 12003) {
    const client = new net.Socket();

    return {
        start: () => new Promise(resolve => client.connect(port, ip, () => resolve())),
        stop: () => client.end(),
        write: message => {
            if(typeof message === 'string') {
                return client.write(message);
            }

            message.forEach(part => client.write(part));
        }
    }
};
