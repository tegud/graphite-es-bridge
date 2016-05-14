"use strict";

const should = require('should');
const defaultParser = require('../../lib/parsers/default');

describe('default parser', function() {
    it('returns nothing if the metric does not match', () =>
        should.not.exist(defaultParser('a.b.c.d')));

    it('splits 5 part metrics', () => defaultParser('a.b.c.d.e').should.be.eql({
            class: 'a',
            host: 'b',
            group: 'c',
            service: 'd',
            metric: 'e'
        }));
});
