const should = require('should');
const TestClient = require('./lib/test-tcp-client');
const FakeEsBulkServer = require('./lib/fake-es-bulk-server');

const Bridge = require('../lib/server');

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

    function startBridgeWithClients(bridgeConfig, ...testClients) {
        esServer = new FakeEsBulkServer();
        bridge = new Bridge(bridgeConfig);

        clients = [...testClients];

        return Promise.all([
            esServer.start(),
            bridge.start()
        ]).then(Promise.all(clients.map(client => client.start())))
    }

    describe('Graphite to ES listens on TCP Port 12003 and publishes to Elasticsearch', () => {
        it('simple metric in one packet', done => {
            startBridgeWithClients({
                elasticsearch: { host: '127.0.0.1:9200' },
                pushEvery: 20
            }, new TestClient())
                .then(() => clients[0].write('servers.servername.process.w3wpnum6.ioreadb 0 1462974890\n'));

            esServer.onRequest(responseLines => {
                responseLines[1].should.have.properties({ 'metric': 'ioreadb' });
                done();
            });
        });

        it('handles multiple connections', done => {
            startBridgeWithClients({
                elasticsearch: { host: '127.0.0.1:9200' },
                pushEvery: 20
            }, new TestClient(), new TestClient())
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
            startBridgeWithClients({
                elasticsearch: { host: '127.0.0.1:9200' },
                pushEvery: 150
            }, new TestClient(), new TestClient())
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
            startBridgeWithClients({
                elasticsearch: { host: '127.0.0.1:9200' },
                pushEvery: 20
            }, new TestClient())
            .then(() => clients[0].write(['servers.servername.process.', 'w3wpnum6.ioreadb 0 1462974890\n']));

            esServer.onRequest(responseLines => {
                responseLines[1].should.have.properties({ 'metric': 'ioreadb' });
                done();
            });
        });

        it('matches custom parser', done => {
            startBridgeWithClients({
                elasticsearch: { host: '127.0.0.1:9200' },
                pushEvery: 20
            }, new TestClient())
            .then(() => clients[0].write('stats.gauges.elasticsearch.search_elasticsearch_cluster_production.node.search_elasticsearch_server001.tlrg.org_production.thread_pool.flush.largest 0 1462974890\n'));

            esServer.onRequest(responseLines => {
                responseLines[1].should.have.properties({ 'metric': 'thread_pool.flush.largest' });
                done();
            });
        });

        describe('sets common properties', () => {
            it('full_name', done => {
                startBridgeWithClients({
                    elasticsearch: { host: '127.0.0.1:9200' },
                    pushEvery: 20
                }, new TestClient())
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
            startBridgeWithClients({
                port: [12003, 2003],
                elasticsearch: { host: '127.0.0.1:9200' },
                pushEvery: 20
            }, new TestClient('127.0.0.1', 12003), new TestClient('127.0.0.1', 2003))
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
