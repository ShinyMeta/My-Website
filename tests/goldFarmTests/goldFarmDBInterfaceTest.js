const assert = require('assert')
const rewire = require('rewire')
const sinon = require('sinon')

const DBIF = rewire('../../routes/goldFarmModules/goldFarmDBInterface')



describe('Gold Farm DB Interface Tests', () => {

  //////////////////////////////////////////
  //        QUERY WRAPPER FUNCTION
  //////////////////////////////////////////


  describe('query: function(queryString, queryObject)', () => {
    let getConnection
    let revert_getConnection
    let mysqlConnection

    beforeEach(() => {
      //need to stub pool.getConnection
      //can inject errors or fake connection object (which can query)
      getConnection = sinon.stub()
      revert_getConnection = DBIF.__set__('pool.getConnection', getConnection)

      mysqlConnection = {
        query: sinon.stub(),
        release: sinon.stub()
      }
    })

    afterEach (() => {
      revert_getConnection()
    })

    it ('should call pool.getConnection, mysqlConnection.query and .release on valid querystring', () => {
      getConnection.yields(null, mysqlConnection)
      mysqlConnection.query.yields(null, 'result')
      let queryString = 'this is a query string'
      return DBIF.query(queryString)
        .then((result) => {
          sinon.assert.called(getConnection)
          sinon.assert.calledWith(mysqlConnection.query, queryString)
          sinon.assert.called(mysqlConnection.release)
        })
    })

    it ('should call mysqlConnection.query with additional queryObject if given', () => {
      getConnection.yields(null, mysqlConnection)
      mysqlConnection.query.yields(null, 'result')
      let queryString = 'this is a query string'
      let queryObject = {x: 'this is a queryObject'}
      return DBIF.query(queryString, queryObject)
        .then((result) => {
          sinon.assert.calledWith(mysqlConnection.query, queryString, queryObject)
        })
    })

    it ('should resolve with result on valid querystring', () => {
      getConnection.yields(null, mysqlConnection)
      mysqlConnection.query.yields(null, 'result')
      return DBIF.query('this is a query string')
        .then((result) => {
          assert.deepEqual(result, 'result')
        })
    })

    it ('should reject with error on invalid querystring', () => {
      getConnection.yields(null, mysqlConnection)
      const error_message = 'invalid querystring'
      mysqlConnection.query.yields(new Error(error_message))
      return DBIF.query('this is not a valid query string')
        .catch((err) => {
          assert.deepEqual(err.message, error_message)
        })
    })

    it ('should reject with error on failing to get a connection from pool', () => {
      const error_message = 'failed to get connection'
      getConnection.yields(new Error(error_message))
      return DBIF.query('this is a query string')
        .catch((err) => {
          assert.deepEqual(err.message, error_message)
        })
    })
  })

  /////////////////////////////////////////
  /////////////////////////////////////////



  ////////////////////////////////////////
  //  SELECT - INSERT - UPDATE - DELETE
  ////////////////////////////////////////

  describe('selectQuery: function(tablename, where, columns)', () => {

    let tablename = 'users'
    let user1a = {
      username: 'test selectQuery username1a',
      password: 'test selectQuery password1',
      apikey: 'test selectQuery apikey'
    }
    let user1b = {
      username: 'test selectQuery username1b',
      password: 'test selectQuery password1',
      apikey: 'test selectQuery apikey'
    }
    let user2 = {
      username: 'test selectQuery username2',
      password: 'test selectQuery password2',
      apikey: 'test selectQuery apikey'
    }

    before(() => {
      return Promise.all([
        DBIF.insertQuery(tablename, user1a)
          .then((result) => {user1a.id = result.insertId}),
        DBIF.insertQuery(tablename, user1b)
          .then((result) => {user1b.id = result.insertId}),
        DBIF.insertQuery(tablename, user2)
          .then((result) => {user2.id = result.insertId})
      ])
    })

    after(() => {
      return DBIF.query('TRUNCATE TABLE users')
    })

    it ('should return all records when no where specified', () => {
      return DBIF.selectQuery(tablename)
        .then((result) => {
          assert.equal(result.length, 3)
        })
    })

    it ('should return records based on WHERE filter', () => {
      let where = {password: 'test selectQuery password1'}
      return DBIF.selectQuery(tablename, {where})
        .then((result) => {
          assert.equal(result.length, 2)
        })
    })

    it ('should return records with only the columns specified', () => {
      let columns = ['id', 'password']
      return DBIF.selectQuery(tablename, {columns})
        .then((result) => {
          assert(result[0].id)
          assert(result[0].password)
          assert.equal(result[0].username, undefined)
          assert.equal(result[0].apikey, undefined)
        })
    })



  })

  /////////////////////////////////////////
  /////////////////////////////////////////

  describe('insertQuery: function(tablename, object)', () => {

    let tablename = 'users'
    let testuser = {
      username: 'test insertQuery username',
      password: 'test insertQuery password',
      apikey: 'test insertQuery apikey'
    }

    afterEach(() => {
      return DBIF.query('TRUNCATE TABLE users')
      // return DBIF.query('DELETE FROM users WHERE username = ?', testuser.username)
    })

    it ('should insert object into table with tableName', () => {
      return DBIF.insertQuery(tablename, testuser)
        .then(() => DBIF.query('SELECT * FROM users WHERE username = ?', testuser.username) )
        .then((users) => {
          assert.equal(users[0].password, testuser.password)
      })
    })

    it('should return containing the id of the newly inserted record', () => {
      let newRecordId
      return DBIF.insertQuery(tablename, testuser)
        .then((result) => {
          newRecordId = result.insertId
        })
        .then(() => DBIF.query('SELECT * FROM users WHERE id = ?', newRecordId) )
        .then((users) => {
          assert.equal(typeof(newRecordId), 'number')
          assert.equal(users[0].password, testuser.password)
        })
    })



  })

  /////////////////////////////////////////
  /////////////////////////////////////////

  describe('updateQuery: function(tablename, update, where)', () => {

    let tablename = 'users'
    let user1a = {
      username: 'test updateQuery username1a',
      password: 'test updateQuery password1',
      apikey: 'test updateQuery apikey'
    }
    let user1b = {
      username: 'test updateQuery username1b',
      password: 'test updateQuery password1',
      apikey: 'test updateQuery apikey'
    }
    let user2 = {
      username: 'test updateQuery username2',
      password: 'test updateQuery password2',
      apikey: 'test updateQuery apikey'
    }

    before(() => {
      return Promise.all([
        DBIF.insertQuery(tablename, user1a)
          .then((result) => {user1a.id = result.insertId}),
        DBIF.insertQuery(tablename, user1b)
          .then((result) => {user1b.id = result.insertId}),
        DBIF.insertQuery(tablename, user2)
          .then((result) => {user2.id = result.insertId})
      ])
    })

    after(() => {
      return DBIF.query('TRUNCATE TABLE users')
    })



    it('updates the specified properties of records that match the WHERE filter', () => {
      let where = {username: 'test updateQuery username2'}
      let update = {password: 'poopy'}
      return DBIF.updateQuery(tablename, update, where)
        .then((result) => {
          assert.equal(result.changedRows, 1)
          return DBIF.selectQuery(tablename, {where})
        })
        .then((result) => {
          assert.equal(result[0].password, 'poopy')
        })
    })
  })

  /////////////////////////////////////////
  /////////////////////////////////////////

  describe('deleteQuery: function(tablename, where)', () => {

    let tablename = 'users'
    let user1a = {
      username: 'test deleteQuery username1a',
      password: 'test deleteQuery password1',
      apikey: 'test deleteQuery apikey'
    }
    let user1b = {
      username: 'test deleteQuery username1b',
      password: 'test deleteQuery password1',
      apikey: 'test deleteQuery apikey'
    }
    let user2 = {
      username: 'test deleteQuery username2',
      password: 'test deleteQuery password2',
      apikey: 'test deleteQuery apikey'
    }

    beforeEach(() => {
      return Promise.all([
        DBIF.insertQuery(tablename, user1a)
          .then((result) => {user1a.id = result.insertId}),
        DBIF.insertQuery(tablename, user1b)
          .then((result) => {user1b.id = result.insertId}),
        DBIF.insertQuery(tablename, user2)
          .then((result) => {user2.id = result.insertId})
      ])
    })

    afterEach(() => {
      return DBIF.query('TRUNCATE TABLE users')
    })

    it('should delete only the records that match the WHERE filter', () => {
      let where = {password: 'test deleteQuery password1'}
      return (DBIF.deleteQuery(tablename, where))
        .then((result) => {
          assert.equal(result.affectedRows, 2)
          return DBIF.selectQuery(tablename, {where})
        })
        .then((result) => {
          assert.equal(result.length, 0)
        })
    })


  })

  /////////////////////////////////////////
  /////////////////////////////////////////

  describe('constructWhere: function (whereObject)', () => {

    let a = 'apple'
    let b = 'balloon'
    let c = 'charlie'


    describe ('when given an object with key-value pairs', () => {

      let whereObject = {a, b}
      let expected = `a = 'apple' AND b = 'balloon'`

      it ('should return string with AND between the key-value pairs', () => {
          assert.deepEqual(DBIF.constructWhere(whereObject), expected)
      })

    })

    describe ('when given an array of objects with key-value pairs', () => {

      let whereObject = [{a}, {b}, {c}]
      let expected = `a = 'apple' OR b = 'balloon' OR c = 'charlie'`

      it ('should return string with OR between the key-value pairs', () => {
        assert.deepEqual(DBIF.constructWhere(whereObject), expected)
      })
    })

    describe ('when given a nesting of arrays and objects', () => {

      let whereObject
      let expected

      it ('should allow AND inside of OR', () => {
        whereObject = [{a, b},{c}]
        expected = `(a = 'apple' AND b = 'balloon') OR c = 'charlie'`
        assert.deepEqual(DBIF.constructWhere(whereObject), expected)
      })

      it ('should allow OR inside of AND', () => {
        whereObject = {one: [{a}, {b}], c}
        expected = `(a = 'apple' OR b = 'balloon') AND c = 'charlie'`
        assert.deepEqual(DBIF.constructWhere(whereObject), expected)
      })
    })

    describe ('when given an invalid where object', () => {

      it ('should throw empty array error', () => {
        assert.throws( () => DBIF.constructWhere([]),
          (err) => err.message == 'invalid whereObject: Empty Array')
      })

      it ('should throw empty object error', () => {
        assert.throws( () => DBIF.constructWhere({}),
          (err) => err.message == 'invalid whereObject: Empty Object')
      })

      it ('should throw not an object error', () => {
        assert.throws( () => DBIF.constructWhere('stringything'),
          (err) => err.message == 'invalid whereObject: Not typeof object')
      })

    })
  })


  describe('peekObjectLength: function(object)', () => {
    let a = 'apple'
    let b = 'balloon'
    let c = 'charlie'

    it ('returns the length of an object treated as an associative array', () => {
      assert.equal(DBIF.peekObjectLength({a, b, c}), 3)
      assert.equal(DBIF.peekObjectLength({a}), 1)
      assert.equal(DBIF.peekObjectLength({}), 0)
    })
  })

})
