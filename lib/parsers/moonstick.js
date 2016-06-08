const MatchAndMapParsers = require('./utilities').MatchAndMapParsers;

module.exports = new MatchAndMapParsers('moonstick', {
    'moonstick': {
        regex: /^stats_counts\.(\w+)\.moonstick(\.(\w+))?\.(\w+)$/,
        mapper: matches => {
            const metric = {
                service: 'moonstick',
                server: matches[1],
                metric: matches[4]
            };

            if(matches[3]) {
                metric.api = matches[3];
            }

            return metric;
        }
    }
});
