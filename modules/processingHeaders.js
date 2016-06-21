'use strict';

module.exports = {

    getContentType: (req)=> {
        return getHeader(req.headers, 'content-type');
    },

    getContentLength: (req)=> {
        return getHeader(req.headers, 'content-length');
    }

};

function getHeader(headers, wantedHeader) {
    for (let header in headers) {
        if (header == wantedHeader) {
            return headers[header];
        }
    }
    return false;
}