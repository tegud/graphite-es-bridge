const http = require('http');
const EventEmitter = require('events');

module.exports = function FakeEsBulkServer() {
    const eventEmitter = new EventEmitter();
	const server = http.createServer(function(request, response) {
        let body = '';

		request.on('data', function(chunk) {
			body += chunk;
		});

		request.on('end', function() {
            eventEmitter.emit('request', request);

			response.writeHead(200, { "Content-Type": "text/html" });
			response.end(JSON.stringify({}));
		});
	});

	return {
		start: () => new Promise(resolve => server.listen(9200, resolve())),
		stop: function() {
			server.close();
		},
        onRequest: handler => eventEmitter.on('request', handler)
	}
};
