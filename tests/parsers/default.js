"use strict";

const should = require('should');
const defaultParser = require('../../lib/parsers/default');

describe('default parser', function() {
    it('splits 5 part metrics', () => defaultParser('a.b.c.d.e').should.have.properties({
            class: 'a',
            host: 'b',
            group: 'c',
            service: 'd',
            metric: 'e'
        }));

    it('handles 5 part metrics with key value pairs', () => defaultParser('a.b.c.k=v.e').should.have.properties({
        class:'a',
        host: 'b',
        service: 'c',
        k: 'v',
        metric: 'e'
    }));
});
