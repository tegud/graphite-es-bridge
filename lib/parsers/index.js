const fs = require('fs');

let parsers = [];

module.exports = {
    load: () => new Promise(resolve => {
        fs.readdir(`${__dirname}`, (err, items) => {
            Promise.all(items.map(item => new Promise(resolve => fs.stat(`${__dirname}/${item}`, (err, stats) => resolve({
                file: item,
                isDir: stats.isDirectory()
            })))))
                .then(items => {
                    parsers = [...items.reduce((all, current) => {
                        if(current.isDir || current.file === 'index.js' || current.file === 'default.js') {
                            return all;
                        }

                        all.push(require(`./${current.file}`))

                        return all;
                    }, []), require('./default')];

                    resolve();
                });
        });
    }),
    parse: key => {
        const remainingParsers = [...parsers];
        let parsedKey;
        let current;

        while((current = remainingParsers.shift()) && !parsedKey) {
            parsedKey = current(key);
        }

        return parsedKey;
    }
};
