var elasticsearch = require('./elasticsearch')();
var kafka = require('./kafka')();

module.exports = function () {
    return {
        elasticsearch: elasticsearch.parse,
        kafka: kafka.parse
    }
}
