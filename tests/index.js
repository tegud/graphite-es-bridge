"use strict";

const http = require('http');
const should = require('should');
const _ = require('lodash');
const net = require('net');
const EventEmitter = require('events');

const Bridge = require('../lib/server');

function FakeEsBulkServer() {
    const eventEmitter = new EventEmitter();
	const server = http.createServer(function(request, response) {
        let body = '';

		request.on('data', function(chunk) {
			body += chunk;
		});

		request.on('end', function() {
            eventEmitter.emit('request', request);

			response.writeHead(200, { "Content-Type": "text/html" });
			response.end(JSON.stringify({}));
		});
	});

	return {
		start: () => new Promise(resolve => server.listen(9200, resolve())),
		stop: function() {
			server.close();
		},
        onRequest: handler => eventEmitter.on('request', handler)
	}
};


describe('Stores metrics to ES', function() {
    let esServer;
    let client;
    let bridge;

    afterEach(done => {
        const promises = [bridge.stop()];

        if(esServer) {
            promises.push(esServer.stop());
        }

        if(client) {
            promises.push((client.end ? client.end() : client.stop()));
        }

        Promise.all(promises).then(() => {
            esServer = undefined;
            client = undefined;
            done();
        });
    });

    function TestClient(port, ip) {
        const client = new net.Socket();

        return {
            start: () => new Promise(resolve => client.connect(port, ip || '127.0.0.1', () => resolve())),
            stop: () => client.end(),
            write: message => {
                if(typeof message === 'string') {
                    return client.write(message);
                }
                
                message.forEach(part => client.write(part));
            }
        }
    }

    it('simple metric in one packet', done => {
        esServer = new FakeEsBulkServer();
        bridge = new Bridge({
            elasticsearch: { host: '127.0.0.1:9200' },
            pushEvery: 20
        });
        client = new TestClient(12003);

        Promise.all([
            esServer.start(),
            bridge.start()
        ])
        .then(() => client.start())
        .then(() => client.write('servers.servername.process.w3wpnum6.ioreadb 0 1462974890\n'));

        esServer.onRequest(() => done());
    });

    it('split metric', done => {
        esServer = new FakeEsBulkServer();
        bridge = new Bridge({
            elasticsearch: { host: '127.0.0.1:9200' },
            pushEvery: 20
        });
        client = new TestClient(12003);

        Promise.all([
            esServer.start(),
            bridge.start()
        ])
        .then(() => client.start())
        .then(() => client.write(['servers.servername.process.', 'w3wpnum6.ioreadb 0 1462974890\n']));

        esServer.onRequest(() => done());
    });
});
