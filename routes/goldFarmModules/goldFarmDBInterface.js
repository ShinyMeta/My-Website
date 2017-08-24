
'use strict';

const mysql = require('mysql');

const config = require('./goldFarmDBConfig')[process.env.NODE_ENV || 'default']
let pool = mysql.createPool(config);



module.exports = {


  //////////////////////////////////////////
  //        QUERY WRAPPER FUNCTION
  //////////////////////////////////////////

  // basic wrapper function for a simple query
  query: function(queryString, queryObject){
    return new Promise((resolve, reject) => {
      pool.getConnection(function(err, mysqlConnection){

        if (err){
          reject(err);
        }

        let query
        if (queryObject) {
          query = mysqlConnection.query(queryString, queryObject, queryCallback);
        } else {
          query = mysqlConnection.query(queryString, queryCallback);
        }
        // console.log(query.sql); //uncomment if you need to see sql for debugging


        //internal function just to avoid code duplication
        function queryCallback(err, result){
          mysqlConnection.release()
          
          if (err)  reject(err)
          else      resolve(result)
        }
      });
    });
  },



  ////////////////////////////////////////
  //  SELECT - INSERT - UPDATE - DELETE
  ////////////////////////////////////////

  // COLUMNS should be an array[]/string, WHERE whould be an object{}
  // selectQuery(tablename, {columns, where})
  selectQuery: function(tablename, {columns = '*', where} = {columns: '*'}){
    let queryString = 'SELECT ?? FROM ??'
    let options = []

    options.push(columns)
    options.push(tablename)

    if (where) {
      queryString = 'SELECT ?? FROM ?? WHERE ' + this.constructWhere(where)
    }
    return this.query(queryString, options)
  },



  insertQuery: function(tablename, object){
    let queryString = 'INSERT INTO ' + tablename + ' SET ?'
    return this.query(queryString, object)
  },



  updateQuery: function(tablename, update, where){
    let queryString = 'UPDATE ?? SET ? WHERE ' + this.constructWhere(where)
    return this.query(queryString, [tablename, update])
  },


  deleteQuery: function(tablename, where){
    let queryString = 'DELETE FROM ?? WHERE ' + this.constructWhere(where)
    return this.query(queryString, [tablename])
  },


  //this function takes in an object with key-value pairs organized for a WHERE statement
  // and returns a string with AND connecting obj values, OR connecting array values
  constructWhere: function (whereObject){
    let whereString

    //Array
    if (Array.isArray(whereObject)){
      if (this.peekObjectLength(whereObject) === 0) {
        throw new Error('invalid whereObject: Empty Array')
      }
      whereString = whereObject
        .map ((x) => {
          if (this.peekObjectLength(x) > 1)
            return `(${this.constructWhere(x)})`
          else
            return this.constructWhere(x)
          } )
        .join(' OR ')
    }

    // Object/associative array
    else if (typeof whereObject == 'object'){
      if (Object.keys(whereObject).length === 0){
        throw new Error('invalid whereObject: Empty Object')
      }
      return Object.keys(whereObject)
        .filter((x) => whereObject.hasOwnProperty(x))
        .map((x) => {
          if (typeof whereObject[x] == 'object')
            return `(${this.constructWhere(whereObject[x])})`
          else
            return `${x} = '${whereObject[x]}'`
        })
        .join(' AND ')
    }

    //not an object type
    else {
      throw new Error('invalid whereObject: Not typeof object')
    }

    return whereString
  },

  //used by constructWhere, gets the 'length' of associative array obj
  peekObjectLength: function(object) {
    return Object.keys(object)
      .filter((x) => object.hasOwnProperty(x))
      .length
  }
}
