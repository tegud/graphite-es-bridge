module.exports = function () {
    const topicLagRegex = /^stats\.gauges\.(\w+)\.topic\.lag\.(\w+)\.acquisitions_(?:live_)?(\w+)$/;

    return {
        parse: function (key) {
            const match = topicLagRegex.exec(key);
            if(match) {
                return {
                    class: "kafka-topic-lag",
                    environment: match[1],
                    application: match[2],
                    topic: match[3]
                }
            }
        }
    }
}
