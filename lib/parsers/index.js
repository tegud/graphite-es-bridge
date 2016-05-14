const fs = require('fs');

const parserFilesToIgnore = ['index.js', 'default.js'];
let parsers = [];

function getFileInfo(dir, item) {
    return new Promise(resolve => fs.stat(`${__dirname}/${item}`, (err, stats) => resolve({
        file: item,
        isDir: stats.isDirectory()
    })));
}

function removeDirectories(allItems) {
    return new Promise(resolve => resolve(allItems.reduce((allFiles, currentItem) => {
        if(currentItem.isDir) {
            return allFiles;
        }

        allFiles.push(currentItem);

        return allFiles;
    }, [])));
}

function getFilesFromDirectory(dir) {
    const getFileInfoForDir = getFileInfo.bind(undefined, dir);

    return new Promise(resolve =>
        fs.readdir(dir, (err, items) => Promise.all(items.map(getFileInfoForDir))
            .then(results => removeDirectories(results))
            .then(results => resolve(results))));
}

function filterAndSetParserList(items) {
    return new Promise(resolve => {
        parsers = [...items.reduce((all, current) => {
            if(parserFilesToIgnore.includes(current.file)) {
                return all;
            }

            all.push(require(`./${current.file}`))

            return all;
        }, []), require('./default')];

        console.log(parsers);

        resolve();
    });
}

module.exports = {
    load: () => getFilesFromDirectory(__dirname).then(items => filterAndSetParserList(items)),
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
