const http = require('http');
const fs = require('fs').promises; // Import fs.promises for asynchronous file operations
const mime = require('mime-types');
const path = require('path');
const chatServer = require('./lib/chat_server');
const cache = {};

function send404(response) {
    response.writeHead(404, { 'Content-Type': 'text/plain' }); // Set status code to 404
    response.write('404 Error: NOT FOUND');
    response.end();
}

async function sendFile(response, filePath) {
    try {
        const fileContents = await fs.readFile(filePath);
        response.writeHead(200, { 'Content-Type': mime.lookup(filePath) });
        response.end(fileContents);
    } catch (error) {
        send404(response);
    }
}

async function serveStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        try {
            const stats = await fs.stat(absPath);
            if (stats.isFile()) {
                const data = await fs.readFile(absPath);
                cache[absPath] = data;
                sendFile(response, absPath);
            } else {
                send404(response);
            }
        } catch (error) {
            send404(response);
        }
    }
}

const server = http.createServer(function(request, response) {
    let filePath = false;
    if (request.url =='/') {
        filePath = '/public/index.html';
    } else {
        filePath = 'public' + request.url;
    }
    const absPath = path.join(__dirname, filePath); // Use path.join for correct path concatenation
    serveStatic(response, cache, absPath);
});

chatServer.listen(server);

server.listen(3000, function() {
    console.log("Server listening on port 3000.");
});
