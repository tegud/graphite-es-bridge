"use strict";

const should = require('should');
const FakeEsBulkServer = require('./lib/fake-es-bulk-server');
const proxyquire = require('proxyquire');
const fakeMoment = require('./lib/fake-moment')();

const Store = proxyquire('../lib/store-to-elasticsearch', {
    'moment': fakeMoment.moment
});

describe('Stores metrics to ES', function() {
    let esServer;

    afterEach(done => {
        esServer.stop();
        fakeMoment.clear();
        esServer = undefined;
        done();
    });

    it('sets index metrics-YYYY.MM by default', done => {
        esServer = new FakeEsBulkServer();
        const store = new Store({ host: '127.0.0.1:9200' });

        esServer.onRequest(responseLines => {
            responseLines[0].index.should.have.properties({ '_index': 'metrics-2016.04' });
            done();
        });

        fakeMoment.setDate('2016-04-14T00:00:00')
            .then(() => esServer.start())
            .then(() => store.store([{}]));
    });

    it('sets index to specified format', done => {
        esServer = new FakeEsBulkServer();
        const store = new Store({ host: '127.0.0.1:9200', index: 'metrics-${YYYY}.${MM}.${DD}' });

        esServer.onRequest(responseLines => {
            responseLines[0].index.should.have.properties({ '_index': 'metrics-2016.04.14' });
            done();
        });

        fakeMoment.setDate('2016-04-14T00:00:00')
            .then(() => esServer.start())
            .then(() => store.store([{}]));
    });

    it('sets type to metric by default', done => {
        esServer = new FakeEsBulkServer();
        const store = new Store({ host: '127.0.0.1:9200' });

        esServer.onRequest(responseLines => {
            responseLines[0].index.should.have.properties({ '_type': 'metric' });
            done();
        });

        fakeMoment.setDate('2016-04-14T00:00:00')
            .then(() => esServer.start())
            .then(() => store.store([{}]));
    });

    it('sets type to metric to configured value', done => {
        esServer = new FakeEsBulkServer();
        const store = new Store({ host: '127.0.0.1:9200', type: 'graphite-metric' });

        esServer.onRequest(responseLines => {
            responseLines[0].index.should.have.properties({ '_type': 'graphite-metric' });
            done();
        });

        fakeMoment.setDate('2016-04-14T00:00:00')
            .then(() => esServer.start())
            .then(() => store.store([{}]));
    });
});
