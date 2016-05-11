var elasticsearch = require('./elasticsearch')();
var kafkaTopicLag = require('./kafkaTopicLag')();

module.exports = function () {
    return {
        elasticsearch: elasticsearch.parse,
        kafkaTopicLag: kafkaTopicLag.parse
    }
}
