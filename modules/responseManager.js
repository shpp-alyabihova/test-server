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

    createWritableStream(resFile) {
        let _this = this;
        fs.stat(resFile.path, (err, stats)=> {
            if (err || !stats.isFile() || stats.size == 0) {
                let data = (err) ? err.toString() : 'no content';
                _this.sendResponse(204, 'no content', { "data": data });
            } else {
                let file = new fs.ReadStream(resFile.path);

                file.pipe(_this.response);
                file
                    .on('error', (err)=> {
                        _this.sendResponse(500, 'internal server error', { "error": err.toString() });
                    })
                    .on('close', ()=> {
                        _this.response.writeHead(200, {
                            "Content-Type": resFile.contentType,
                            "Content-Length": stats.size
                        });
                    });
                _this.response
                    .on('close', ()=> {
                        file.destroy();
                    });

            }
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