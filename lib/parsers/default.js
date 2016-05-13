module.exports = function defaultParser(key) {
    const keyParts = key.split('.');

    if (keyParts.length == 5) {
        return {
            class: keyParts[0],
            host: keyParts[1],
            group: keyParts[2],
            service: keyParts[3],
            metric: keyParts[4]
        };
    }
}
