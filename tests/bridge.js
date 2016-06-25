"use strict";

const should = require('should');
const net = require('net');
const FakeEsBulkServer = require('./lib/fake-es-bulk-server');

const Bridge = require('../lib/server');

function TestClient(ip = '127.0.0.1', port = 12003) {
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
}

describe('Graphite to ES Bridge', function() {
    let esServer;
    let clients = [];
    let bridge;

    afterEach(done => Promise.all([bridge.stop(), esServer.stop(), ...clients.map(client => client.stop())]).then(() => {
        try {
            esServer = undefined;
            clients = [];
            done();
        }
        catch(e) {
            console.log(e);
        }
    }));

    describe('Graphite to ES listens on TCP Port 12003 and publishes to Elasticsearch', () => {
        it('simple metric in one packet', done => {
            esServer = new FakeEsBulkServer();
            bridge = new Bridge({
                elasticsearch: { host: '127.0.0.1:9200' },
                pushEvery: 20
            });
            clients.push(new TestClient());

            Promise.all([
                esServer.start(),
                bridge.start()
            ])
            .then(() => clients[0].start())
            .then(() => clients[0].write('servers.servername.process.w3wpnum6.ioreadb 0 1462974890\n'));

            esServer.onRequest(responseLines => {
                responseLines[1].should.have.properties({ 'metric': 'ioreadb' });
                done();
            });
        });

        it('handles multiple connections', done => {
            esServer = new FakeEsBulkServer();
            bridge = new Bridge({
                elasticsearch: { host: '127.0.0.1:9200' },
                pushEvery: 20
            });
            clients.push(new TestClient());
            clients.push(new TestClient());

            Promise.all([
                esServer.start(),
                bridge.start()
            ])
            .then(Promise.all(clients.map(client => client.start())))
            .then(() => {
                clients[0].write('servers.servername.process.w3wpnum6.metric1 0 1462974890\n');
                clients[1].write('servers.servername.process.w3wpnum6.metric2 0 1462974890\n');
            });

            esServer.onRequest(responseLines => {
                responseLines[1].should.have.properties({ 'metric': 'metric1' });
                responseLines[3].should.have.properties({ 'metric': 'metric2' });
                done();
            });
        });

        it('handles multiple connections with split metrics', done => {
            esServer = new FakeEsBulkServer();
            bridge = new Bridge({
                elasticsearch: { host: '127.0.0.1:9200' },
                pushEvery: 150
            });
            clients.push(new TestClient());
            clients.push(new TestClient());

            Promise.all([
                esServer.start(),
                bridge.start()
            ])
            .then(Promise.all(clients.map(client => client.start())))
            .then(() => {
                clients[0].write('servers.servername.process');
                clients[1].write('servers.servername.process.w3wpnum6.metric2 0 1462974890\n');
                setTimeout(() => clients[0].write('.w3wpnum6.metric1 0 1462974890\n'), 50);
            });

            esServer.onRequest(responseLines => {
                console.log(responseLines);
                responseLines[1].should.have.properties({ 'metric': 'metric2' });
                responseLines[3].should.have.properties({ 'metric': 'metric1' });
                done();
            });
        });

        it('split metric', done => {
            esServer = new FakeEsBulkServer();
            bridge = new Bridge({
                elasticsearch: { host: '127.0.0.1:9200' },
                pushEvery: 20
            });

            clients.push(new TestClient());

            Promise.all([
                esServer.start(),
                bridge.start()
            ])
            .then(() => clients[0].start())
            .then(() => clients[0].write(['servers.servername.process.', 'w3wpnum6.ioreadb 0 1462974890\n']));

            esServer.onRequest(responseLines => {
                responseLines[1].should.have.properties({ 'metric': 'ioreadb' });
                done();
            });
        });

        it('matches custom parser', done => {
            esServer = new FakeEsBulkServer();
            bridge = new Bridge({
                elasticsearch: { host: '127.0.0.1:9200' },
                pushEvery: 20
            });
            clients.push(new TestClient());

            Promise.all([
                esServer.start(),
                bridge.start()
            ])
            .then(() => clients[0].start())
            .then(() => clients[0].write('stats.gauges.elasticsearch.search_elasticsearch_cluster_production.node.search_elasticsearch_server001.tlrg.org_production.thread_pool.flush.largest 0 1462974890\n'));

            esServer.onRequest(responseLines => {
                responseLines[1].should.have.properties({ 'metric': 'thread_pool.flush.largest' });
                done();
            });
        });

        describe('sets common properties', () => {
            it('full_name', done => {
                esServer = new FakeEsBulkServer();
                bridge = new Bridge({
                    elasticsearch: { host: '127.0.0.1:9200' },
                    pushEvery: 20
                });
                clients.push(new TestClient());

                Promise.all([
                    esServer.start(),
                    bridge.start()
                ])
                .then(() => clients[0].start())
                .then(() => clients[0].write('servers.servername.process.w3wpnum6.ioreadb 0 1462974890\n'));

                esServer.onRequest(responseLines => {
                    responseLines[1].should.have.properties({ 'full_name': 'servers.servername.process.w3wpnum6.ioreadb' });
                    done();
                });
            });
        });
    });

    describe('Graphite to ES listens on multiple port bindings', () => {
        it('simple metric in one packet', done => {
            esServer = new FakeEsBulkServer();
            bridge = new Bridge({
                port: [12003, 2003],
                elasticsearch: { host: '127.0.0.1:9200' },
                pushEvery: 20
            });
            clients.push(new TestClient('127.0.0.1', 12003));
            clients.push(new TestClient('127.0.0.1', 2003));

            Promise.all([
                    esServer.start(),
                    bridge.start()
                ])
                .then(Promise.all(clients.map(client => client.start())))
                .then(() => clients[0].write('servers.servername.process.w3wpnum6.metric1 0 1462974890\n'))
                .then(() => new Promise(resolve => setTimeout(() => resolve(), 5)))
                .then(() => clients[1].write('servers.servername.process.w3wpnum6.metric2 0 1462974890\n'));

            let allResponses = [];

            esServer.onRequest(responseLines => {
                allResponses = allResponses.concat(responseLines);
                if(allResponses.length > 3) {
                    responseLines[1].should.have.properties({ 'metric': 'metric1' });
                    responseLines[3].should.have.properties({ 'metric': 'metric2' });

                    done();
                }
            });
        });
    });
});
