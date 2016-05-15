
function matchAndMapKey(regex, mapper, key) {
    const matches = regex.exec(key);

    if (!matches) {
        return;
    }

    return mapper(matches);
}

exports.MatchAndMapParsers = function(stringCheck, parserConfig) {
    let stringChecker = () => true;

    if(typeof stringCheck === 'string') {
        stringChecker = key => key.toLowerCase().indexOf(stringCheck) > -1;
    }
    else {
        parserConfig = stringCheck;
    }

    const parsers = Object.keys(parserConfig).map(name => matchAndMapKey.bind(undefined, parserConfig[name].regex, parserConfig[name].mapper));

    return key => {
        if(!stringChecker(key)) {
            return;
        }

        for(let x = 0; x < parsers.length; x++) {
            const parsedKey = parsers[x](key);

            if(parsedKey) {
                return parsedKey;
            }
        }
    };
}
