const http = require('http');
const fs = require('fs');
const mime = require('mime-types');
const path = require('path');
const chatServer = require('./lib/chat_server');

const cache = {};

function send404(response) {
    response.writeHead(400, { 'content-type': 'text/plain' });
    response.write('404 Error: NOT FOUND');
    response.end();
}

function sendfile(response, filePath, fileContents) {
    response.writeHead(200, { 'content-type': mime.lookup(path.basename(filePath)) });
    response.end(fileContents);
}

function serveSatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendfile(response, absPath, cache[absPath]);
    } else {
        fs.promises.stat(absPath)
            .then(() => fs.promises.readFile(absPath))
            .then(data => {
                cache[absPath] = data;
                sendfile(response, absPath, data);
            })
            .catch(() => send404(response));
    }
}

const server = http.createServer((request, response) => {
    let filePath = false;
    if (request.url === '/') {
        filePath = './public/';
    } else {
        filePath = 'public' + request.url;
    }
    const absPath = './' + filePath;
    serveSatic(response, cache, absPath);
});

chatServer.listen(server);

server.listen(3000, () => {
    console.log('Listening at 3000');
});
