const crypto = require('crypto');

const utilities = {};
const environments = require('./environments');
// console.log(environments)

utilities.parseJSON = (jsonString) => {
    let output = {};
    try {
        output = JSON.parse(jsonString)
    } catch {
        output = {};
    }
    return output;
}

utilities.hash = (str) => {
    if(typeof str === 'string' && str.length> 0){
        let hash = crypto.createHmac('sha256', environments.secretKey)
        .update("habijabi").digest('hex');
        return hash;
    } 

    return false;
}

utilities.createRandomString = (strlength) => {
    let length = strlength;
    length = typeof strlength === 'number' && strlength > 0 ? strlength : false;

    if(length) {
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let output = '';
        for(let i = 0; i < length; i++) {
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            output += randomCharacter;
        }
        return output;
    } 
    return false;
}


module.exports = utilities;