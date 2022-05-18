const { handleReqRes } = require("../../helpers/handleReqRes");
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const {createRandomString} = require("../../helpers/utilities")
const {parseJSON } = require('../../helpers/utilities');
const { user } = require("../../routes");

const handler = {};

handler.tokenHandler = (reqProperties, callback) => {
    const acceptedMethods = ["get", "post", "put", "delete"];
    if (acceptedMethods.indexOf(reqProperties.method) > -1) {
        handler._token[reqProperties.method](reqProperties, callback);
    } else {
        callback(405);
    }
};

handler._token = {};

handler._token.post = (reqProperties, callback) => {
    const phone =
        typeof reqProperties.body.phone === "string" &&
        reqProperties.body.phone.trim().length === 11
            ? reqProperties.body.phone
            : false;

    const password =
        typeof reqProperties.body.password === "string" &&
        reqProperties.body.password.trim().length > 0
            ? reqProperties.body.password
            : false;

    if(phone && password) {
        data.read('users', phone, (err, userData) => {
            let hashedPassword = hash(password);
            if(hashedPassword === parseJSON(userData).password) {
                let tokenId = createRandomString(20);
                let expires = Date.now() + 60*60*1000;
                let tokenObject = {
                    'id' : tokenId,
                    phone,
                    expires
                };

                data.create('tokens', tokenId, tokenObject, (err) => {
                    if(!err) {
                        callback(200, tokenObject)
                    } else {
                        callback(500, {
                            error: 'There was a problem in the server side'
                        })
                    }
                })
            } else {
                callback(400, {
                    error: 'Password is not valid'
                })

            }
        })
    } else {
        callback(400, {
            error: 'You have a problem in your request'
        })
    }
};

handler._token.get = (reqProperties, callback) => {
    const id =
    typeof reqProperties.queryStringObject.id === "string" &&
    reqProperties.queryStringObject.id.trim().length === 20
        ? reqProperties.queryStringObject.id
        : false;

if(id) {
    data.read('tokens', id, (err, tokenData) => {
        // console.log(u)
        const token = {...parseJSON(tokenData)};
        // console.log(user)
        if(!err && token) {
            // delete user.password;
            // console.log('-------------------------------',user)
            callback(200, token);
        } else {
            callback(404, {
                error: 'Requested token is not found'
            });
        }
    })
} else {
    callback(404, {
        error: 'Requested  token was not found'
    });
}
};

handler._token.put = (reqProperties, callback) => {
    const id =
        typeof reqProperties.body.id === "string" &&
        reqProperties.body.id.trim().length === 20
            ? reqProperties.body.id
            : false;

    const extend =
        typeof reqProperties.body.extend === "boolean" &&
        reqProperties.body.extend === true
            ? true
            : false;

    if(id && extend) {
        data.read('tokens', id, (err, tokenData) => {
            let tokenObject = parseJSON(tokenData);
            if(tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() * 60 * 60* 1000;
                data.update('tokens', id, tokenObject, (err, tokenObject) => {
                    if(!err) {
                        callback(200, {
                            message: 'Token updated successfully'
                        })
                    } else {
                        callback(500, { 
                            error: 'There was a server side error'
                        })
                    }
                })
            } else {
                callback(400, {
                    error: 'Token is already expired'
                })
            }
        })
    } else {
        callback(400, {
            error: 'There is a problem in your request'
        })
    }
};

handler._token.delete = (reqProperties, callback) => {
    const id =
        typeof reqProperties.queryStringObject.id === "string" &&
        reqProperties.queryStringObject.id.trim().length === 20
            ? reqProperties.queryStringObject.id
            : false;

    if(id) {
        data.read('tokens', id, (err, tokenData) => {
            if(!err && tokenData) {
                data.delete('tokens', id, (err) => {
                    if(!err) {
                        callback(200, {
                            message: 'Token deleted'
                        })
                    } else {
                        callback(500, {
                            error: 'There was a problem in your server side'
                        })
                    }
                })
            } else {
                callback(500, {
                    error: 'There was a problem in your server side'
                })
            }
        })
    } else{
        callback(400, {
            error: 'There was a problem in your server side'
        })
    }
};

handler._token.verify = (id, phone, callback) => {
    // console.log(phone)
    data.read('tokens', id, (err, tokenData) => {
        // console.log(tokenData)
        if(!err && tokenData){
            if(parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()){
                callback(true)
            } else {
                callback(false)
            }

        } else {
            callback(false)
        }
    })
}

module.exports = handler;
