const elasticsearch = require('./elasticsearch')();
const kafkaTopicLag = require('./kafkaTopicLag')();

module.exports = function () {
    return {
        elasticsearch: elasticsearch.parse,
        kafkaTopicLag: kafkaTopicLag.parse
    }
}
