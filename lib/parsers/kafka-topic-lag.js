const MatchAndMapParsers = require('./utilities').MatchAndMapParsers;

module.exports = new MatchAndMapParsers('topic.lag', {
    'topic': {
        regex: /^stats\.gauges\.(\w+)\.?topic\.lag\.(\w+)\.acquisitions_(?:live_)?(\w+)$/,
        mapper: matches => ({
            class: "kafka-topic-lag",
            environment: matches[1],
            application: matches[2],
            topic: matches[3]
        })
    }
});
