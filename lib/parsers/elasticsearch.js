function matchAndMapKey(regex, mapper, key) {
    const matches = regex.exec(key);

    if (!matches) {
        return;
    }

    return mapper(matches);
}

const parsers = [
    matchAndMapKey.bind(undefined, /^stats\.gauges\.elasticsearch\.(\w+)\.node\.(\w+_[^_]+_\w+)\.(.+)$/, (matches) => {
        const result = {
            class: "elasticsearch",
            cluster: matches[1],
            node: matches[2],
            metric: matches[3]
        };

        return result;
    }),
    matchAndMapKey.bind(undefined, /^stats\.gauges\.elasticsearch\.(\w+)\.index\.(\w+)\.(.+)$/, (matches) => {
        const result = {
            class: "elasticsearch",
            cluster: matches[1],
            index: matches[2],
            metric: matches[3]
        };

        return result;
    })
];

module.exports = key => {
    if (key.toLowerCase().indexOf('elasticsearch') < 0) {
        return;
    }

    for(let x = 0; x < parsers.length; x++) {
        const parsedKey = parsers[x](key);

        if(parsedKey) {
            return parsedKey;
        }
    }

    return;
};
