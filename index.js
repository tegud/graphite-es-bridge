new require('./lib/server')({
    elasticsearch: {
        host: '10.44.72.62:9200'
    }
}).start();
