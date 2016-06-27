const MatchAndMapParsers = require('./utilities').MatchAndMapParsers;

module.exports = new MatchAndMapParsers('elasticsearch', {
    'node': {
        regex: /^stats\.gauges\.elasticsearch\.(\w+)\.node\.(\w+_[^_]+_\w+)\.(.+)$/,
        mapper: matches => {
            console.log('ES HIT');
            return {
                class: "elasticsearch",
                cluster: matches[1],
                node: matches[2],
                metric: matches[3]
            };
        }
    },
    'index': {
        regex: /^stats\.gauges\.elasticsearch\.(\w+)\.index\.(\w+)\.(.+)$/,
        mapper: matches => {
            console.log('ES HIT');
            return {
                class: "elasticsearch",
                cluster: matches[1],
                index: matches[2],
                metric: matches[3]
            }
        }
    }
});
