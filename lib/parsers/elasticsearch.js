module.exports = function () {
    const esNodeRegex = /^stats\.gauges\.elasticsearch\.(\w+)\.node\.(\w+_[^_]+_\w+)\.(.+)$/;
    const esIndexRegex = /^stats\.gauges\.elasticsearch\.(\w+)\.index\.(\w+)\.(.+)$/;

    return {
        parse: function(key) {
            const nodeMatch = esNodeRegex.exec(key)
            if (nodeMatch) {
                return {
                    class: "elasticsearch",
                    cluster: nodeMatch[1],
                    node: nodeMatch[2],
                    metric: nodeMatch[3]
                }
            }
            const indexMatch = esIndexRegex.exec(key)
            if (indexMatch) {
                return {
                    class: "elasticsearch",
                    cluster: indexMatch[1],
                    index: indexMatch[2],
                    metric: indexMatch[3]
                }
            }
            return;
        }
    }
}
