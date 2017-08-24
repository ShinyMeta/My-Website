const assert = require('assert')
const rewire = require('rewire')
const sinon = require('sinon')

const DB = rewire('../../routes/goldFarmModules/goldFarmDB')
const DBIF = require('../../routes/goldFarmModules/goldFarmDBInterface')



describe('Gold Farm DB Tests', () => {



  /////////////////////////////////////////////
  //            USER TABLE TESTS
  /////////////////////////////////////////////

  describe('USER TABLE TESTS', () => {

    describe('DB.addUser = function(user)', () => {

      let testuser = {
        username: 'test addUser',
        password: 'test',
        apikey: 'this totes isn`t a valid APIKEY'
      }

      let insertQuery

      beforeEach(() => {
        insertQuery = sinon.spy(DBIF, 'insertQuery')
      })

      afterEach(() => {
        insertQuery.restore()
        return DBIF.query('TRUNCATE TABLE users')
      })


      it('should call insertQuery with "users" and the user object', () => {
        return DB.addUser(testuser)
        .then((result) => {
          sinon.assert.calledWith(insertQuery, 'users', testuser)
        })
      })

      it('should not add, and throw an error when username already exists in database', () => {
        return DB.addUser(testuser)
        .then(() => DB.addUser(testuser))
        .then(() => assert.fail('addUser did not throw error'))
        .catch((err) => {
          assert.equal(err.message, 'username already taken')
        })
        .then(() => DBIF.query('SELECT * FROM users WHERE username = "' +
        testuser.username + '"') )
        .then((users) => {
          assert.equal(users[1], undefined)
        })
      })

    })


    describe('DB.getUser = function ({username, userid})', () => {

      const testuser = {
        username: 'test getUser',
        password:'test addUser pass',
        apikey: 'test addUser apikey'
      }


      before(() => {
        return DB.addUser(testuser)
          .then((result) => {
            testuser.id = result.insertId;
          })
      })

      after(() => {
        return DBIF.query('TRUNCATE TABLE users')
      })


      describe('when given an id', () => {
        it ('should return the user matching the id', () => {
          return DB.getUser({userid: testuser.id})
            .then((result) => {
              assert.deepEqual(result, testuser)
            })
        })
      })

      describe('when given a username but not an id', () => {
        it('should return the user matching the username', () => {
          return DB.getUser({username: testuser.username})
            .then((result) => {
              assert.deepEqual(result, testuser)
            })
        })
      })

      describe('when given no id or username', () => {
        it('should throw an error', () => {
          return DB.getUser({})
            .catch((err) => {
              assert.equal(err.message, 'no username or userid specified')
            })
        })
      })

      describe('when there is no record matching the request', () => {

        it('should return undefined', () => {
          return DB.getUser({username: 'this user is not in DB'})
          .then((result) => {
            assert.equal(result, undefined)
          })

        })
      })

    })

  })







  /////////////////////////////////////////////
  //           METHOD TABLE TESTS
  /////////////////////////////////////////////

  describe('METHOD TABLE TESTS', () => {

    describe('DB.getMethod = function(where)', () => {

      const tablename = 'methods'
      let method1a = {
        name: 'getMethod 1a',
        userid: 1
      }
      let method1b = {
        name: 'getMethod 1b',
        userid: 1
      }
      let method2 = {
        name: 'getMethod 2',
        userid: 2
      }
      let method2a = {
        name: 'getMethod 1a',
        userid: 2
      }

      before(() => {
        return Promise.all([
          DBIF.insertQuery(tablename, method1a)
            .then((result) => {method1a.id = result.insertId}),
          DBIF.insertQuery(tablename, method1b)
            .then((result) => {method1b.id = result.insertId}),
          DBIF.insertQuery(tablename, method2)
            .then((result) => {method2.id = result.insertId}),
          DBIF.insertQuery(tablename, method2a)
            .then((result) => {method2a.id = result.insertId})
        ])
      })

      after(() => {
        return DBIF.query('TRUNCATE TABLE methods')
      })


      it ('should return the record matching the method name and userid', () => {
        const where = {
          name: 'getMethod 1a',
          userid: 1
        }
        return DB.getMethod(where)
          .then((result) => {
            assert.deepEqual(result[0], method1a)
          })
      })




    })


    describe('DB.addMethod = function (method)', () => {

      let insertQuery

      let testMethod = {
        name: 'testMethod',
        userid: 1
      }

      beforeEach(() => {
        insertQuery = sinon.spy(DBIF, 'insertQuery')
      })

      afterEach(() => {
        insertQuery.restore()
        return DBIF.query('TRUNCATE TABLE methods')
      })


      it ('should call insertQuery with "methods" and test  method', () => {
        return DB.addMethod(testMethod)
          .then(() => {
            sinon.assert.calledWith(insertQuery, 'methods', testMethod)
          })
      })

      it ('should throw an error if method can already be found in DB', () => {
        return DBIF.insertQuery('methods', testMethod)
          .then(() => DB.addMethod(testMethod))
          .catch((err) => {
            assert.equal(err.message, 'addMethod Error: method already exists')
          })
      })

    })


    describe('DB.deleteMethod = function (where)', () => {

      let deleteQuery

      let testMethod1 = {
        name: 'test1',
        userid: 1
      }
      let testMethod2 = {
        name: 'test2',
        userid: 1
      }

      beforeEach(() => {
        deleteQuery = sinon.spy(DBIF, 'deleteQuery')
        return Promise.all([
          DB.addMethod(testMethod1),
          DB.addMethod(testMethod2),
        ])
      })

      afterEach(() => {
        deleteQuery.restore()
        return DBIF.query('TRUNCATE TABLE methods')
      })

      it ('should call deleteQuery with "methods" and where to delete', () => {
        return DB.deleteMethod(testMethod1)
          .then(() => {
            sinon.assert.calledWith(deleteQuery, 'methods', testMethod1)
          })
      })

      it ('should throw an error if nothing was deleted', () => {
        return DB.deleteMethod({name: 'not in DB'})
          .catch((err) => {
            assert.equal(err.message, 'deleteMethod: no records matched specification')
          })
      })

    })


    describe('DB.editMethod = function (method, newName)', () => {

      let testMethod = {
        name: 'testMethod',
        userid: 1
      }

      before(() => {
        return DBIF.insertQuery('methods', testMethod)
      })

      after(() => {
        return DBIF.query('TRUNCATE TABLE methods')
      })

      it ('should change the name of the method record', () => {
        return DB.editMethod(testMethod, 'edited')
          .then(() => DB.getMethod({name:'edited', userid: 1}))
          .then((result) => {
            assert.equal(result[0].name, 'edited')
          })
      })
    })
  })






  ////////////////////////////////////////////////////
  //     START AND END BUTTON SUPERFUNCTION TESTS
  ///////////////////////////////////////////////////



  describe('START AND END BUTTON SUPERFUNCTION TESTS', () => {

    describe('DB.getTimeResult = function (user)', () => {

      //stub query function
      let query

      beforeEach(() => {
        query = sinon.stub(DBIF, 'query')
          .returns(Promise.resolve(
            [{starttime: new Date(2017, 1, 1),
            endtime: new Date(2017, 1, 1, 1)}]
          ))
      })

      afterEach(() => {
        query.restore()
      })

      it('should return the difference of two time stamps in seconds', () => {
        return DB.getTimeResult({id: 1})
          .then((result) => {
            assert.equal(result, 3600)
          })
      })



    })

    describe('DB.getWalletResult = function (user)', () => {

      //stub the query
      let query

      let stubReturns = [{
        userid: 1,
        name: 'gold',
        currid: 1,
        startqty: 100,
        endqty: 200
      }]

      let expected = [{
        userid: 1,
        name: 'gold',
        currid: 1,
        qty: 100
      }]

      beforeEach(() => {
        query = sinon.stub(DBIF, 'query')
          .returns(Promise.resolve(stubReturns))
      })

      afterEach(()=> {
        query.restore()
      })

      it ('should get all of the run results from start and end tables', () => {
        return DB.getWalletResult({id:1})
          .then((result) => {
            sinon.assert.called(query)
          })
      })

      it ('should refine the results to just the qty differences and return', () => {
        return DB.getWalletResult({id:1})
          .then((result) => {
            assert.deepEqual(result, expected)
          })
      })
    })

    describe('function currencyQtyDiff({userid, name, currid, startqty, endqty})', () => {

      let currencyQtyDiff = DB.__get__('currencyQtyDiff')

      let hasStartEnd = {
        userid: 1,
        name: 'gold',
        currid: 1,
        startqty: 200,
        endqty: 500
      }
      let hasNoStart = {
        userid: 1,
        name: 'gold',
        currid: 1,
        startqty: null,
        endqty: 500
      }
      let hasNoEnd = {
        userid: 1,
        name: 'gold',
        currid: 1,
        startqty: 200,
        endqty: null
      }

      it('should return the difference in qty when curr has both start and end qty', () => {
        let result = currencyQtyDiff(hasStartEnd)
        assert.equal(result.qty, 300)
      })

      it('should return endqty if has no startqty', () => {
        let result = currencyQtyDiff(hasNoStart)
        assert.equal(result.qty, 500)
      })

      it('should return negative start qty if has no end qty', () => {
        let result = currencyQtyDiff(hasNoEnd)
        assert.equal(result.qty, -200)
      })
    })

    describe('DB.getItemsResult = function (user)', () => {
      //stub the query
      let query

      let stubReturns = Promise.resolve([{
        userid: 1,
        name: 'item',
        itemid: 1,
        startqty: 100,
        endqty: 200
      }])

      let expected = [{
        userid: 1,
        name: 'item',
        itemid: 1,
        qty: 100
      }]

      beforeEach(() => {
        query = sinon.stub(DBIF, 'query')
          .returns(stubReturns)
      })

      afterEach(()=> {
        query.restore()
      })

      it ('should get all of the run results from start and end tables', () => {
        return DB.getItemsResult({id:1})
          .then((result) => {
            sinon.assert.called(query)
          })
      })

      it ('should refine the results to just the qty differences and return', () => {
        return DB.getItemsResult({id:1})
          .then((result) => {
            assert.deepEqual(result, expected)
          })
      })
    })

    describe('function itemQtyDiff({userid, name, itemid, startqty, endqty})', () => {

            let itemQtyDiff = DB.__get__('itemQtyDiff')

            let hasStartEnd = {
              userid: 1,
              name: 'item',
              itemid: 1,
              startqty: 200,
              endqty: 500
            }
            let hasNoStart = {
              userid: 1,
              name: 'item',
              itemid: 1,
              startqty: null,
              endqty: 500
            }
            let hasNoEnd = {
              userid: 1,
              name: 'item',
              itemid: 1,
              startqty: 200,
              endqty: null
            }

            it('should return the difference in qty when item has both start and end qty', () => {
              let result = itemQtyDiff(hasStartEnd)
              assert.equal(result.qty, 300)
            })

            it('should return endqty if has no startqty', () => {
              let result = itemQtyDiff(hasNoStart)
              assert.equal(result.qty, 500)
            })

            it('should return negative start qty if has no end qty', () => {
              let result = itemQtyDiff(hasNoEnd)
              assert.equal(result.qty, -200)
            })
    })

    describe('DB.resetStateTable = function (user, tableName)', () => {

      let deleteQuery
      let insertQuery

      let user = {id:1}
      let expectedWhere = {userid: 1}

      beforeEach(() => {
        deleteQuery = sinon.spy(DBIF, 'deleteQuery')
        insertQuery = sinon.spy(DBIF, 'insertQuery')
      })

      afterEach(() => {
        deleteQuery.restore()
        insertQuery.restore()
      })

      after(() => {
        DBIF.query('TRUNCATE TABLE runstart')
        DBIF.query('TRUNCATE TABLE runstartwallet')
        DBIF.query('TRUNCATE TABLE runstartitems')
      })

      it ('should delete the timestamp and insert a new one(by tablename)', () => {
        return DB.resetStateTable(user, 'runstart')
          .then(() => {
            sinon.assert.calledWith(deleteQuery, 'runstart', expectedWhere)
            sinon.assert.calledWith(insertQuery, 'runstart', expectedWhere)
          })
      })

      it ('should delete all results from the wallet and items(by tablename)', () => {
        return DB.resetStateTable(user, 'runstart')
          .then(() => {
            sinon.assert.calledWith(deleteQuery, 'runstartwallet', expectedWhere)
            sinon.assert.calledWith(deleteQuery, 'runstartitems', expectedWhere)
          })
      })
    })

    describe('DB.addCurrencyToSaveState = function (userid, currid, qty, tableName)', () => {
      let tableName = 'runstartwallet'

      let insertQuery

      beforeEach(() => {
        insertQuery = sinon.spy(DBIF, 'insertQuery')
      })

      afterEach(() => {
        insertQuery.restore()
      })

      after(() => {
        DBIF.query('TRUNCATE TABLE runstartwallet')
      })

      it ('should add a currency record to the tablename', () => {
        return DB.addCurrencyToSaveState(1, 1, 100, tableName)
          .then(() => {
            sinon.assert.calledWith(insertQuery, tableName)
          })
      })
    })

    describe('DB.addItemToSaveState = function (userid, itemid, qty, tableName)', () => {
      let tableName = 'runstartitems'

      let insertQuery

      beforeEach(() => {
        insertQuery = sinon.spy(DBIF, 'insertQuery')
      })

      afterEach(() => {
        insertQuery.restore()
      })

      after(() => {
        DBIF.query('TRUNCATE TABLE runstartitems')
      })

      it ('should add an item record to the tablename', () => {
        return DB.addItemToSaveState(1, 1, 100, tableName)
          .then(() => {
            sinon.assert.calledWith(insertQuery, tableName)
          })
      })
    })


  })






})
