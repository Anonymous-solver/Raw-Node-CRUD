//dependencies
const http = require('http');
const {handleReqRes} = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
const data = require('./lib/data');

const app = {};

// data.create('test', 'newFile', {'name': 'Bangladesh', 'languages': 'English'}, function (err){
//     console.log(err);
// })

// data.read('test', 'newFile', (err, result) => {
//     console.log(err, result);
// })

// data.update('test', 'newFile',{"name": "England", "languages": "English"} , (err, result) => {
//     console.log(err, result);
// })

// data.delete('test', 'newFile', (err, result) => {
//     console.log(err, result);
// })

app.handleReqRes = handleReqRes;

app.createServer = () => {
    const server= http.createServer(app.handleReqRes);
    
    server.listen(environment.port, () => {
        // console.log(`environment variable is ${process.env.NODE_ENV}`);
        console.log(`listening to port ${environment.port}`);
    });
}
  
app.createServer();