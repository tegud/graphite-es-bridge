const topicLagRegex = /^stats\.gauges\.(\w+)\.?topic\.lag\.(\w+)\.acquisitions_(?:live_)?(\w+)$/;

module.exports = key => {
    if (key.toLowerCase().indexOf('topic.lag') < 0) {
        return;
    }

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
