const handler = {}

handler.notFoundHandler = (reqProperties, callback) => {
    callback(404, { message: 'not found'})
}

module.exports = handler;