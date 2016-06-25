new require('./lib/server')({
    port: [12003, 2003],
    elasticsearch: {
        host: '10.44.72.62:9200'
    }
}).start();
