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

function getFileListingForDir(dir) {
    return new Promise(resolve => fs.readdir(dir, (err, items) => resolve(items)));
}

function getFilesFromDirectory(dir) {
    const getFileInfoForDir = getFileInfo.bind(undefined, dir);

    return getFileListingForDir(dir)
        .then(items => Promise.all(items.map(getFileInfoForDir)))
        .then(removeDirectories);
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
