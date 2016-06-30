const parser = require('tlrg-statsd-metricname-parser');

module.exports = function defaultParser(key) {
    return parser(key);
}
