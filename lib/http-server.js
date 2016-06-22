const express = require('express');
const moment = require('moment');
const getOpenConnections = require('./connection-tracker').getOpenConnections;
const webserver = express();

webserver.get('/', (req, res) => {
    res.status(200).send(JSON.stringify({
        "name": "graphite-to-es-bridge",
        "serverTime": moment().format()
    }));
});

webserver.get('/status', (req, res) => res
    .set('Access-Control-Allow-Origin', '*')
    .status(200)
    .send(JSON.stringify({
        "connections": getOpenConnections()
    })));

module.exports = function (config) {
    let httpServer;

    return {
        start: () => new Promise((resolve, reject) => {
            httpServer = webserver.listen(config.port || 1234, (err) => {
                if(err) {
                    reject(err);
                }

                resolve();
            });
        }),
        stop: () => new Promise(resolve => resolve(httpServer.close()))
    };
};
