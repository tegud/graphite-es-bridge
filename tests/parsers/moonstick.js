"use strict";

const should = require('should');
const moonstickParser = require('../../lib/parsers/moonstick');

describe('moonstick metric parser', function() {
    it('returns nothing if the metric does not match', () =>
        should.not.exist(moonstickParser('invalid')));

    describe('for count stats', () => {
        it('sets server', () => moonstickParser('stats_counts.servername001.moonstick.requests_handled')
            .should.be.have.properties({
                server: 'servername001'
            }));

        it('sets service', () => moonstickParser('stats_counts.servername001.moonstick.requests_handled')
            .should.be.have.properties({
                service: 'moonstick'
            }));

        it('sets metric', () => moonstickParser('stats_counts.servername001.moonstick.requests_handled')
            .should.be.have.properties({
                metric: 'requests_handled'
            }));

        it('sets api when present', () => moonstickParser('stats_counts.servername001.moonstick.hotelDetails.active_requests')
            .should.be.have.properties({
                api: 'hotelDetails'
            }));
    });
});
