const fs = require('fs');

module.exports = (function() {
    let writeFileTimeout;
    let missingMetrics = [];

    function startFileWriteTimer() {
        setTimeout(() => {
            fs.writeFile('/tmp/graphite-es-bridge-missing.log', missingMetrics.join('\n'), 'utf-8', err => {
                if(err) {
                    console.log(`Error writing missing metrics file: ${err}`);
                }

                missingMetrics = [];
                startFileWriteTimer();
            });

        }, 30000)
    }

    return {
        start: () => new Promise(resolve => resolve(startFileWriteTimer())),
        stop: () => new Promise(resolve => resolve(clearTimeout(writeFileTimeout))),
        register: metric => missingMetrics.push(metric)
    };
})();
