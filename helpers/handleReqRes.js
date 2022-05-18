//dependencies
const url = require('url');
const {StringDecoder} = require('string_decoder');
const routes  = require('../routes');
const {sampleHandler} = require('../handlers/routeHandlers/sampleHandler');
const {notFoundHandler} = require('../handlers/routeHandlers/notFoundHandler');
const { parseJSON } = require('../helpers/utilities')

//app object/ module scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
    const path = url.parse(req.url, true); 
    const pathName = path.pathname;
    const trimmedPath = pathName.replace(/^\/+|\/+$/g, '');
    const reqHeaders = req.headers;
    const method = req.method.toLowerCase();
    const queryStringObject = path.query;
    // console.log(queryStringObject)

    const reqProperties = {
        path,
        trimmedPath,
        method,
        reqHeaders,
        queryStringObject
    };
    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

    const decoder = new StringDecoder('utf-8');
    let fullData = '';
    
    req.on('data', (buffer) => {
        fullData += decoder.write(buffer);
    });
    
    req.on('end', () => {
        fullData += decoder.end();

        reqProperties.body = parseJSON(fullData);

        chosenHandler(reqProperties, (statusCode, payload) => {
            statusCode = typeof statusCode === 'number' ? statusCode: 500;
            payload = typeof payload === 'object' ? payload : {};
            res.writeHead(statusCode);
            res.end(JSON.stringify(payload))
        })
        // res.end("Hello world!!!!");
    })
}

module.exports = handler;