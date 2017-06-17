
var express = require('express');
var router = express.Router();
var mysql = require('mysql');


//module.exports = router;
module.exports = router;

var API_KEY = 'access_token=58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';

var characterRequestURL = 'api.guildwars2.com/v2/characters?page=0&access_token=58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';
var walletRequestURL = 'api.guildwars2.com/v2/account/wallet?access_token=58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';
var bankRequestURL = 'api.guildwars2.com/v2/account/bank?access_token=58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';
var matStorageRequestURL = 'api.guildwars2.com/v2/account/materials?access_token=58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';



var mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mywebserver',
  database: 'goldfarmingdatabase'
});

mysqlConnection.connect();



router
  .get('/methods/:username', function (req, res) {
    console.log('received request to methods');
    var methods = getMethodsByUsername(req.params.username, function(result){
      console.log(result);

      res.send(result);
    });
  })
  .post('/', function (req, res) {


  })
;







//////////////////////////////////////////
//       REQUEST HELPER FUNCTIONS
//////////////////////////////////////////


//search mySQL database for methods under username
function getMethodsByUsername(username, callback){
  //sql query for table with only methods with a userid that matches the username
  var queryString = 'SELECT name FROM users INNER JOIN methods ON users.id = methods.userid ' +
    'WHERE users.username = ' + mysqlConnection.escape(username);

  var query = mysqlConnection.query(queryString, function(err, result){
    console.log(query.sql);

    if (err){
      console.error(err);
      return;
    }
    callback(result);
  });
}
