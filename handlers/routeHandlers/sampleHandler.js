const handler = {};

handler.sampleHandler = (reqProperties, callback) => {
    callback(200, {
        message: 'this is sample code'
    })
}

module.exports = handler;