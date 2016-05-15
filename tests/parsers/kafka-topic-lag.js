"use strict";

const should = require('should');
const kafkaTopicParser = require('../../lib/parsers/kafka-topic-lag');

describe('kafka topic lag metric parser', function() {
    it('returns nothing if the metric does not match', () =>
        should.not.exist(kafkaTopicParser('invalid')));

    describe('for matching node stats', () => {
        it('sets class to kafka-topic-lag', () => kafkaTopicParser('stats.gauges.live.topic.lag.Rates_Store.acquisitions_live_change_tlrgextranet')
            .should.be.have.properties({
                class: 'kafka-topic-lag'
            }));

        it('sets environment', () => kafkaTopicParser('stats.gauges.live.topic.lag.Rates_Store.acquisitions_live_change_tlrgextranet')
            .should.be.have.properties({
                environment: 'live'
            }));

        it('sets topic', () => kafkaTopicParser('stats.gauges.live.topic.lag.Rates_Store.acquisitions_live_change_tlrgextranet')
            .should.be.have.properties({
                topic: 'change_tlrgextranet'
            }));
    });
});
