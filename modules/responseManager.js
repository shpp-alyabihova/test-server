'use strict';

const fs = require('fs');

class ResponseManager {
    constructor(req, res) {
        this.request = req;
        this.response = res;
    }

    createReadableStream(filePath, callback) {
        let _this = this;
        let file = fs.createWriteStream(filePath);
        _this.request.pipe(file);
        file
            .on('error', (err)=> {
                _this.sendResponse(500, 'internal server error', { "error": err.toString() });
            })
            .on('finish', ()=> {
                return callback();
            });
        _this.response
            .on('close', ()=> {
                file.destroy();
            });
    }

    sendResponse(code, message, data) {
        let _this = this;
        _this.response.statusMessage = message;
        _this.response.statusCode = code;
        _this.response.writeHead(code, {
            "Content-Type": "application/json"
        });
        _this.response.end(JSON.stringify(data));
    }

}

module.exports = ResponseManager;