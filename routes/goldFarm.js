
var express = require('express');
var router = express.Router();
var mysql = require('mysql');


module.exports = router;

//module.exports = addMethod;



var API_KEY = 'access_token=58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';

var characterRequestURL = 'api.guildwars2.com/v2/characters?page=0&access_token=58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';
var walletRequestURL = 'api.guildwars2.com/v2/account/wallet?access_token=58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';
var bankRequestURL = 'api.guildwars2.com/v2/account/bank?access_token=58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';
var matStorageRequestURL = 'api.guildwars2.com/v2/account/materials?access_token=58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20';



var pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'mywebserver',
  database: 'goldfarmingdatabase'
});




router
  .get('/methods/:username', function (req, res) {
    console.log('received request to methods');
    var methods = getMethodsByUsername(req.params.username, function(result){
      console.log(result);

      res.send(result);
    });
  })
  .post('/newmethod', function (req, res) {
    //console.log(req.body);
    //add method/return false if method exists
    addMethod(req.body.name, req.body.username, function(result){
      console.log (result);
      res.send(result);
    });
  })
  .post('/deletemethod', function (req, res) {
    //console.log(req.body);
    //delete method/return false if method exists
    deleteMethod(req.body.name, req.body.username, function(result){
      console.log(result);
      res.send(result);
    });
  })
  .post('/editmethod', function (req, res) {
    //console.log(req.body);
    //delete method/return false if method exists
    editMethod(req.body.name, req.body.newName, req.body.username, function(result){
      console.log(result);
      res.send(result);
    });
  })
;







//////////////////////////////////////////
//       REQUEST HELPER FUNCTIONS
//////////////////////////////////////////


//search mySQL database for methods under username
function getMethodsByUsername(username, callback){
  //sql query for table with only methods with a userid that matches the username

  pool.getConnection(function(err, mysqlConnection){
    if (err){
      console.error(err);
      return;
    }
    var queryString = 'SELECT name FROM users INNER JOIN methods ON users.id = methods.userid ' +
      'WHERE users.username = ' + mysqlConnection.escape(username);
    var query = mysqlConnection.query(queryString, function(err, result){
      //console.log(query.sql);
      mysqlConnection.release();

      if (err){
        console.error(err);
        return;
      }
      callback(result);
    });
  });
}

//add method to methods table, return success status
function addMethod(methodName, username, callback){

  //first verify that username is correct
  getUserIdByUsername(username, function(userid){
    //next check if method with same user and name exists, if so, return false (unsuccessful)
    checkMethodNameExists(methodName, userid, function(methodExists){

      if(methodExists){
        callback(false);
      }
      else {
        pool.getConnection(function(err, mysqlConnection){
          if (err){
            console.error(err);
            return;
          }
          //here, we know method does not exist, so we can add safely
          var queryString = 'INSERT INTO methods (name, userid) VALUES ' +
            '("' + methodName + '",' + userid + ')';
          var query = mysqlConnection.query(queryString, function(err, result){
            //console.log(query.sql);
            mysqlConnection.release();
            if (err){
              console.error(err);
              return;
            }
            // console.log(result);
            //if you made it this far, we successfully added the method
            callback(true);
          });
        });
      }
    });
  });




}

//delete method return succes status
function deleteMethod(methodName, username, callback){
  //first verify that username is correct
  getUserIdByUsername(username, function(userid){
    //next check if method with same user and name exists, if not, return false (unsuccessful)
    checkMethodNameExists(methodName, userid, function(methodExists){

      if(!methodExists){
        callback(false);
      }
      else {
        //here, we know method does exist, so we can delete safely
        pool.getConnection(function(err, mysqlConnection){
          if (err){
            console.error(err);
            return;
          }
          var queryString = 'DELETE FROM methods WHERE name = "' + methodName + '"';
          var query = mysqlConnection.query(queryString, function(err, result){
            //console.log(query.sql);
            mysqlConnection.release();
            if (err){
              console.error(err);
              callback(false);
              return;
            }
            // console.log(result);
            //if you made it this far, we successfully deleted the method
            callback(true);
          });
        });
      }
    });
  });

}

//edit method name return succes status
function editMethod(methodName, newName, username, callback){
  //first verify that username is correct
  getUserIdByUsername(username, function(userid){
    //next check if method with same user and name exists, if not, return false (unsuccessful)
    checkMethodNameExists(methodName, userid, function(methodExists){

      if(!methodExists){
        callback(false);
      }
      else {
        //here, we know method does exist, so we can edit safely
        pool.getConnection(function(err, mysqlConnection){
          if (err){
            console.error(err);
            return;
          }
          var queryString = 'UPDATE methods SET name = "' + newName +
            '" WHERE name = "' + methodName + '"';
          var query = mysqlConnection.query(queryString, function(err, result){
            //console.log(query.sql);
            mysqlConnection.release();
            if (err){
              console.error(err);
              callback(false);
              return;
            }
            // console.log(result);
            //if you made it this far, we successfully edited the method
            callback(true);
          });
        });
      }
    });
  });

}

function checkMethodNameExists(name, userid, callback){
  //check if method with same user and name exists, if so, return false (unsuccessful)
  pool.getConnection(function(err, mysqlConnection){
    if (err){
      console.error(err);
      return;
    }
    var queryString = 'SELECT id FROM methods ' +
      'WHERE name = "' + name + '" AND userid = ' + userid;

    var query = mysqlConnection.query(queryString, function(err, result){
      // console.log(query.sql);
      mysqlConnection.release();
      if (err){
        console.error(err);
        return;
      }
      // console.log(result);
      if (result.length === 0){
        //if no results, that means there is no method with same name for this userid
        callback(false);
      }
      else {
        callback(true);
      }
    });
  });
}

function getUserIdByUsername(username, callback){
  pool.getConnection(function(err, mysqlConnection){
    if (err){
      console.error(err);
      return;
    }
    var queryString = "SELECT id FROM users WHERE username = '" + username + "'";
    var query = mysqlConnection.query(queryString, function(err, result){
      // console.log(query.sql);
      mysqlConnection.release();
      if (err){
        console.error(err);
        return;
      }
      // console.log(result);
      //if there is anything in the list, return the user, otherwise return 0
      if (result.length === 1){
        callback(result[0].id);
      }
      else {
        callback(0);
      }
    });
  });
}
