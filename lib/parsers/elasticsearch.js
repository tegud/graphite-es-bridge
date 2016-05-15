const statParsers = {
    'node': {
        regex: /^stats\.gauges\.elasticsearch\.(\w+)\.node\.(\w+_[^_]+_\w+)\.(.+)$/,
        mapper: matches => ({
            class: "elasticsearch",
            cluster: matches[1],
            node: matches[2],
            metric: matches[3]
        })
    },
    'index': {
        regex: /^stats\.gauges\.elasticsearch\.(\w+)\.index\.(\w+)\.(.+)$/,
        mapper: matches => ({
            class: "elasticsearch",
            cluster: matches[1],
            index: matches[2],
            metric: matches[3]
        })
    }
};

function matchAndMapKey(regex, mapper, key) {
    const matches = regex.exec(key);

    if (!matches) {
        return;
    }

    return mapper(matches);
}

const parsers = Object.keys(statParsers).map(name => matchAndMapKey.bind(undefined, statParsers[name].regex, statParsers[name].mapper));

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
