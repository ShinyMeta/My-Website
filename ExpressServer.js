
//run server command:
//cd My Documents/Atom Projects/My Webpage/
//node ExpressServer.js

var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

//app is for controlling the server
var app = express();

//testing getting the raw body
app.use (function(req, res, next) {
    var data='';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
       data += chunk;
    });

    req.on('end', function() {
        req.body = data;
        next();
    });
});


app.use(bodyParser.urlencoded({ extended: false }));


//Easy routing to for requesting files
app.use(express.static('root'));

// //if accessing the server address directly
// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });



//when a post request is sent to write XML
app.post('/XML/*', function(req, res) {
  //console.log(req.body);
  //console.log(req.params[0]);
  //res.send(req.body);
  var stream = fs.createWriteStream("root/pogomapp-data/Maps/"+req.params[0]+".xml");
  stream.once('open', function(fd) {
    stream.write(req.body);
    stream.end();
  });

  res.send();
});


//this starts the server
app.listen(80, function () {
  console.log('Example app listening on port 80!');
});

// //testing file save
// var fs = require('fs');
// var stream = fs.createWriteStream("my_file.txt");
// stream.once('open', function(fd) {
//   stream.write("My first row\n");
//   stream.write("My second row\n");
//   stream.end();
// });
