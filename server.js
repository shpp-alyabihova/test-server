'use strict';

const http = require('http');
const config = require('./config.json');

const headers = require('./modules/processingHeaders.js');
const ResponseManager = require('./modules/responseManager.js');

let currentFile = { path: config.directory + config.filename };
let tmpFile = { path: config.tmpDirectory + config.filename };

const server = http.createServer();
server.on('request', (req, res)=> {
    if (req.method == 'POST') {
        let resManager = new ResponseManager(req, res);
        let contentLength = +headers.getContentLength(resManager.request);
        if (contentLength > 0 && contentLength <= config.maxContentLength) {
            resManager.createReadableStream(tmpFile.path, ()=> {
                let contentType = headers.getContentType(resManager.request);
                let tmp = currentFile.path;
                currentFile.path = tmpFile.path;
                currentFile.contentType = contentType || 'text/plain';
                tmpFile.path = tmp;
            });
        }
        resManager.createWritableStream(currentFile);


    } else {
        res.statusMessage = 'Bad Request';
        res.statusCode = 400;
        res.writeHead(400, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({ "info": "POST request is expected" }));
    }
});

server.listen(config.port, ()=> {
    console.info(`Running on ${config.hostname}:${config.port}`);
});
