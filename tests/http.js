"use strict";

const http = require('http');
const should = require('should');
const _ = require('lodash');
const FakeEsBulkServer = require('./lib/fake-es-bulk-server');
const TestClient = require('./lib/test-tcp-client');

const Bridge = require('../lib/server');

function makeRequest(requestOptions, body) {
    return new Promise(resolve => {
        var request =  http.request(_.merge({}, {
            host: 'localhost',
            port: 1234
        }, requestOptions), response => {
            var allData = '';

            response.on('data', function (chunk) {
                allData += chunk;
            });

            response.on('end', function () {
                resolve({
                    response: response,
                    data: allData
                })
            });
        });

        if(body) {
            request.write(body);
        }

        request.end();
    })
}

describe('responds to http requests', function() {
    let esServer;
    let clients = [];
    let bridge;

    afterEach(done => Promise.all([bridge.stop(), esServer.stop(), ...clients.map(client => client.stop())]).then(() => {
        esServer = undefined;
        clients = [];
        done();
    }));

    describe('status', function() {
        it('contains active connections', () => {
            esServer = new FakeEsBulkServer();
            bridge = new Bridge({
                elasticsearch: { host: '127.0.0.1:9200' },
                pushEvery: 20
            });
            clients.push(new TestClient());

            return Promise.all([
                esServer.start(),
                bridge.start()
            ])
            .then(() => clients[0].start())
            .then(() => makeRequest({
                path: '/status',
                method: 'GET'
            }))
            .then(response => new Promise(resolve => resolve(JSON.parse(response.data).connections)))
            .should.eventually.eql([ { from: '::ffff:127.0.0.1', to: 12003 } ]);
        });

        it('contains active connections on multiple ports', () => {
            esServer = new FakeEsBulkServer();
            bridge = new Bridge({
                port: [12003, 2003],
                elasticsearch: { host: '127.0.0.1:9200' },
                pushEvery: 20
            });
            clients.push(new TestClient('127.0.0.1', 12003));
            clients.push(new TestClient('127.0.0.1', 2003));

            return Promise.all([
                esServer.start(),
                bridge.start()
            ])
            .then(Promise.all(clients.map(client => client.start())))
            .then(() => makeRequest({
                path: '/status',
                method: 'GET'
            }))
            .then(response => new Promise(resolve => resolve(JSON.parse(response.data).connections)))
            .should.eventually.eql([
                { from: '::ffff:127.0.0.1', to: 12003 },
                { from: '::ffff:127.0.0.1', to: 2003 }
            ]);
        });

        it('removes disconnected connections', () => {
            esServer = new FakeEsBulkServer();
            bridge = new Bridge({
                elasticsearch: { host: '127.0.0.1:9200' },
                pushEvery: 20
            });
            clients.push(new TestClient());

            return Promise.all([
                esServer.start(),
                bridge.start()
            ])
            .then(() => clients[0].start())
            .then(() => clients[0].stop())
            .then(() => makeRequest({
                path: '/status',
                method: 'GET'
            }))
            .then(response => new Promise(resolve => resolve(JSON.parse(response.data).connections)))
            .should.eventually.eql([]);
        });
    });
});
