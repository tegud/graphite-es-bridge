const elasticsearch = require('./elasticsearch')();
const kafkaTopicLag = require('./kafka-topic-lag')();

module.exports = function () {
    return {
        elasticsearch: elasticsearch.parse,
        kafkaTopicLag: kafkaTopicLag.parse
    }
}
