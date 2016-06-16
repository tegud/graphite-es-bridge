"use strict";

const should = require('should');
const net = require('net');
const FakeEsBulkServer = require('./lib/fake-es-bulk-server');

const Bridge = require('../lib/server');

function TestClient() {
    const client = new net.Socket();

    return {
        start: () => new Promise(resolve => client.connect(12003, '127.0.0.1', () => resolve())),
        stop: () => client.end(),
        write: message => {
            if(typeof message === 'string') {
                return client.write(message);
            }

            message.forEach(part => client.write(part));
        }
    }
}

describe('Graphite to ES listens on TCP Port 12003 and publishes to Elasticsearch', function() {
    let esServer;
    let client;
    let bridge;

    afterEach(done => Promise.all([bridge.stop(), esServer.stop(), client.stop()]).then(() => {
        esServer = undefined;
        client = undefined;
        done();
    }));

    it('simple metric in one packet', done => {
        esServer = new FakeEsBulkServer();
        bridge = new Bridge({
            elasticsearch: { host: '127.0.0.1:9200' },
            pushEvery: 20
        });
        client = new TestClient();

        Promise.all([
            esServer.start(),
            bridge.start()
        ])
        .then(() => client.start())
        .then(() => client.write('servers.servername.process.w3wpnum6.ioreadb 0 1462974890\n'));

        esServer.onRequest(responseLines => {
            responseLines[1].should.have.properties({ 'metric': 'ioreadb' });
            done();
        });
    });

    it('split metric', done => {
        esServer = new FakeEsBulkServer();
        bridge = new Bridge({
            elasticsearch: { host: '127.0.0.1:9200' },
            pushEvery: 20
        });
        client = new TestClient();

        Promise.all([
            esServer.start(),
            bridge.start()
        ])
        .then(() => client.start())
        .then(() => client.write(['servers.servername.process.', 'w3wpnum6.ioreadb 0 1462974890\n']));

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
        client = new TestClient();

        Promise.all([
            esServer.start(),
            bridge.start()
        ])
        .then(() => client.start())
        .then(() => client.write('stats.gauges.elasticsearch.search_elasticsearch_cluster_production.node.search_elasticsearch_server001.tlrg.org_production.thread_pool.flush.largest 0 1462974890\n'));

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
            client = new TestClient();

            Promise.all([
                esServer.start(),
                bridge.start()
            ])
            .then(() => client.start())
            .then(() => client.write('servers.servername.process.w3wpnum6.ioreadb 0 1462974890\n'));

            esServer.onRequest(responseLines => {
                responseLines[1].should.have.properties({ 'full_name': 'servers.servername.process.w3wpnum6.ioreadb' });
                done();
            });
        });
    });
});
