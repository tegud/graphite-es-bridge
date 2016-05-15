"use strict";

const should = require('should');
const elasticsearchParser = require('../../lib/parsers/elasticsearch');

describe('elasticsearch metric parser', function() {
    it('returns nothing if the metric does not match', () =>
        should.not.exist(elasticsearchParser('invalid')));

    describe('for matching node stats', () => {
        it('sets class to elasticsearch', () => elasticsearchParser('stats.gauges.elasticsearch.search_elasticsearch_cluster_production.node.search_elasticsearch_server000.tlrg.org_production.fs.total.available_in_bytes')
            .should.be.have.properties({
                class: 'elasticsearch'
            }));

        it('sets cluster', () => elasticsearchParser('stats.gauges.elasticsearch.search_elasticsearch_cluster_production.node.search_elasticsearch_server000.tlrg.org_production.fs.total.available_in_bytes')
            .should.be.have.properties({
                cluster: 'search_elasticsearch_cluster_production'
            }));

        it('sets node', () => elasticsearchParser('stats.gauges.elasticsearch.search_elasticsearch_cluster_production.node.search_elasticsearch_server000.tlrg.org_production.fs.total.available_in_bytes')
            .should.be.have.properties({
                node: 'search_elasticsearch_server000.tlrg.org_production'
            }));

        it('sets metric', () => elasticsearchParser('stats.gauges.elasticsearch.search_elasticsearch_cluster_production.node.search_elasticsearch_server000.tlrg.org_production.fs.total.available_in_bytes')
            .should.be.have.properties({
                metric: 'fs.total.available_in_bytes'
            }));
    });

    describe('for matching index stats', () => {
        it('sets class to elasticsearch', () => elasticsearchParser('stats.gauges.elasticsearch.search_elasticsearch_cluster_production.index.index_name.total.docs.count')
            .should.be.have.properties({
                class: 'elasticsearch'
            }));

        it('sets cluster', () => elasticsearchParser('stats.gauges.elasticsearch.search_elasticsearch_cluster_production.index.index_name.total.docs.count')
            .should.be.have.properties({
                cluster: 'search_elasticsearch_cluster_production'
            }));

        it('sets index', () => elasticsearchParser('stats.gauges.elasticsearch.search_elasticsearch_cluster_production.index.index_name.total.docs.count')
            .should.be.have.properties({
                index: 'index_name'
            }));

        it('sets metric', () => elasticsearchParser('stats.gauges.elasticsearch.search_elasticsearch_cluster_production.index.index_name.total.docs.count')
            .should.be.have.properties({
                metric: 'total.docs.count'
            }));
    });
});
