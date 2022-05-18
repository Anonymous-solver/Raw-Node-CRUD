const { handleReqRes } = require("../../helpers/handleReqRes");
const data = require("../../lib/data");
const { hash } = require("../../helpers/utilities");
const { parseJSON } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");
const { user } = require("../../routes");

const handler = {};

handler.userHandler = (reqProperties, callback) => {
    const acceptedMethods = ["get", "post", "put", "delete"];
    if (acceptedMethods.indexOf(reqProperties.method) > -1) {
        handler._users[reqProperties.method](reqProperties, callback);
    } else {
        callback(405);
    }
};

handler._users = {};

handler._users.post = (reqProperties, callback) => {
    const firstName =
        typeof reqProperties.body.firstName === "string" &&
        reqProperties.body.firstName.trim().length > 0
            ? reqProperties.body.firstName
            : false;
    const lastName =
        typeof reqProperties.body.lastName === "string" &&
        reqProperties.body.lastName.trim().length > 0
            ? reqProperties.body.lastName
            : false;
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

    if (firstName && lastName && phone && password) {
        data.read("users", phone, (err, user) => {
            if (err) {
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                };
                data.create("users", phone, userObject, (err) => {
                    if (!err) {
                        callback(200, {
                            message: "user was created successfully",
                        });
                    } else {
                        callback(500, {
                            error: "could not create user",
                        });
                    }
                });
            } else {
                callback();
            }
        });
    } else {
        callback(400, {
            error: "You have a problem in your request",
        });
    }
};

handler._users.get = (reqProperties, callback) => {
    const phone =
        typeof reqProperties.queryStringObject.phone === "string" &&
        reqProperties.queryStringObject.phone.trim().length === 11
            ? reqProperties.queryStringObject.phone
            : false;

    if (phone) {
        //verify token
        let token =
            typeof reqProperties.reqHeaders.token === "string"
                ? reqProperties.reqHeaders.token
                : false;
        // console.log(token)

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                data.read("users", phone, (err, u) => {
                    // console.log(u)
                    const user = { ...parseJSON(u) };
                    // console.log(user)
                    if (!err && user) {
                        delete user.password;
                        // console.log('-------------------------------',user)
                        callback(200, user);
                    } else {
                        callback(404, {
                            error: "Requested user is not found",
                        });
                    }
                });
            } else {
                callback(403, {
                    error: "Authentication failure",
                });
            }
        });
    } else {
        callback(404, {
            error: "Requested user is not found",
        });
    }
    // callback(200);
};

handler._users.put = (reqProperties, callback) => {
    const phone =
        typeof reqProperties.body.phone === "string" &&
        reqProperties.body.phone.trim().length === 11
            ? reqProperties.body.phone
            : false;

    const firstName =
        typeof reqProperties.body.firstName === "string" &&
        reqProperties.body.firstName.trim().length > 0
            ? reqProperties.body.firstName
            : false;
    const lastName =
        typeof reqProperties.body.lastName === "string" &&
        reqProperties.body.lastName.trim().length > 0
            ? reqProperties.body.lastName
            : false;

    const password =
        typeof reqProperties.body.password === "string" &&
        reqProperties.body.password.trim().length > 0
            ? reqProperties.body.password
            : false;

    if (phone) {
        if (firstName || lastName || password) {
            //verify token
            let token =
                typeof reqProperties.reqHeaders.token === "string"
                    ? reqProperties.reqHeaders.token
                    : false;
            // console.log(token)

            tokenHandler._token.verify(token, phone, (tokenId) => {
                if (tokenId) {
                    data.read("users", phone, (err, uData) => {
                        const userData = { ...parseJSON(uData) };
                        if (!err && userData) {
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.password = hash(password);
                            }
                            //store to database
                            data.update(
                                "users",
                                phone,
                                userData,
                                (err, userData) => {
                                    if (!err) {
                                        callback(200, {
                                            message:
                                                "User was updated successfully",
                                        });
                                    } else {
                                        callback(500, {
                                            error: "There was a problem in your server side",
                                        });
                                    }
                                }
                            );
                        } else {
                            callback(400, {
                                error: "You have a problem in your request",
                            });
                        }
                    });
                } else {
                    callback(403, {
                        error: "Authentication failure",
                    });
                }
            });
        }
    } else {
        callback(400, {
            error: "Invalid phone number. Please try again",
        });
    }
};

handler._users.delete = (reqProperties, callback) => {
    const phone =
        typeof reqProperties.queryStringObject.phone === "string" &&
        reqProperties.queryStringObject.phone.trim().length === 11
            ? reqProperties.queryStringObject.phone
            : false;

    if (phone) {
        //verify token
        let token =
            typeof reqProperties.reqHeaders.token === "string"
                ? reqProperties.reqHeaders.token
                : false;
        // console.log(token)

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                data.read("users", phone, (err, userData) => {
                    if (!err && userData) {
                        data.delete("users", phone, (err) => {
                            if (!err) {
                                callback(200, {
                                    message: "User deleted",
                                });
                            } else {
                                callback(500, {
                                    error: "There was a problem in your server side",
                                });
                            }
                        });
                    } else {
                        callback(500, {
                            error: "There was a problem in your server side",
                        });
                    }
                });
            } else {
                callback(403, {
                    error: "Authentication failure",
                });
            }
        });
    } else {
        callback(400, {
            error: "There was a problem in your server side",
        });
    }
};

module.exports = handler;
