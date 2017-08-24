const assert = require('assert')
const EventEmitter = require('events')
const https = require('https')
const rewire = require('rewire')
const sinon = require('sinon')
const stream = require('stream')

const GW2API = rewire('../../routes/goldFarmModules/goldFarmGW2API')



describe('Gold Farm GW2API Tests', () => {

  ///////////////////////////////////////////
  //     HTTP/API CALL HELPER FUNCTIONS
  ///////////////////////////////////////////

  describe('getHttpsRequest(hostname, path)', () => {
    let sendGetHttpsRequest
    let response
    let revert
    const hostname = 'google.com'
    const path = '/path'

    beforeEach(() => {
      response = new stream.Readable()
      response.push('word')
      response.push('Word')
      response.push('WORD')
      response.push(null);

      sendGetHttpsRequest = sinon.stub().returns(Promise.resolve(response))
      revert = GW2API.__set__({'sendGetHttpsRequest': sendGetHttpsRequest})

    })

    afterEach(() => {
      revert()
    })


    it('should call sendGetHttpsRequest with hostname and path', () => {
      return GW2API.__get__('getHttpsRequest')(hostname, path)
        .then ((result) => {
          sinon.assert.calledWith(sendGetHttpsRequest, hostname, path)
        })
    })

    it('should resolve with concatenated string', () => {
      return GW2API.__get__('getHttpsRequest')(hostname, path)
        .then ((result) => {
          assert.equal(result, 'wordWordWORD')
        })
    })
  })

  describe('sendGetHttpsRequest(hostname, path)', () => {
    let request
    let requestObj

    const hostname = 'google.com'
    const path = '/path'

    beforeEach (() => {
      requestObj = new EventEmitter()
      requestObj.end = function(){}

      request = sinon.stub(https, 'request')
        .returns(requestObj)
    })

    afterEach(() => {
      request.restore();
    })



    it ('should make an https request to correct url', () => {
      const expected = {
        protocol: 'https:',
        hostname: hostname,
        path: path,
        method: 'GET'
      };

      GW2API.__get__('sendGetHttpsRequest')(hostname, path)
      sinon.assert.calledWith(request, expected);
    })


    it ('should call "reject" on thrown error from req', () => {
      let result = GW2API.__get__('sendGetHttpsRequest')(hostname, path)
        .catch((err) => {
          assert.equal(err.message, 'test error')
        })
      requestObj.emit('error', new Error('test error'))
      return result
    })
  })

  describe('getResponseString(response)', () => {
    let response

    beforeEach(() => {
    })


    it ('should concatenate response into one string', () => {
      response = new stream.Readable()
      response.push('word')
      response.push('Word')
      response.push('WORD')
      response.push(null);

      return GW2API.__get__('getResponseString')(response)
        .then((dataString) => assert.equal(dataString, 'wordWordWORD'))
    })

    it ('should reject on error', () => {
      let result = GW2API.__get__('getResponseString')(response)
        .catch((err) => assert.equal(err.message, 'response stream error'))

      response.emit('error', new Error('response stream error'))
      return result
    })
  })

  //////////////////////////////////////////
  //////////////////////////////////////////



  //////////////////////////////////////////
  //       GET ITEM/WALLET CALLS
  //////////////////////////////////////////

  describe('GW2API.getWallet(user)', () => {
    //params/input
    const user = {
      username: 'shinymeta',
      password: 'shinymeta',
      apikey: '58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20',
      id: 1
    }
    //stub
    let getHttpsRequest
    let revert
    //result/output
    let responseObj = [  {
        id: 1,
        value: 450957
      },    {
        id: 2,
        value: 898370
      }  ]
    let response = JSON.stringify(responseObj)


    beforeEach(() => {
      getHttpsRequest = sinon.stub().returns(Promise.resolve(response))
      revert = GW2API.__set__('getHttpsRequest', getHttpsRequest)
    })

    afterEach(() => {
      revert()
    })

    it ('should call httpsRequest to wallet api path', () => {
      return GW2API.getWallet(user)
        .then((result) => {
          sinon.assert.calledWith(getHttpsRequest, 'api.guildwars2.com',
            '/v2/account/wallet?access_token=' + user.apikey)
        })
    })
    it ('should resolve with correct object', () => {
      return GW2API.getWallet(user)
        .then((result) => {
          assert.deepEqual(result, responseObj)
        })
    })
  })

  describe('GW2API.getMats(user)', () => {
    //params/input
    const user = {
      username: 'shinymeta',
      password: 'shinymeta',
      apikey: '58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20',
      id: 1
    }
    //stub
    let getHttpsRequest
    let revert
    //result/output
    let responseObj = [  {
        id: 12134,
        category: 5,
        count: 138
      },  {
        id: 12238,
        category: 5,
        count: 250
      },  {
        id: 12147,
        category: 5,
        count: 55
      },  {
        id: 12142,
        category: 5,
        count: 11
      }  ]
    let response = JSON.stringify(responseObj)

    beforeEach(() => {
      getHttpsRequest = sinon.stub().returns(Promise.resolve(response))
      revert = GW2API.__set__('getHttpsRequest', getHttpsRequest)
    })

    afterEach(() => {
      revert()
    })


    it ('should call httpsRequest to materials api path', () => {
      return GW2API.getMats(user)
        .then((result) => {
          sinon.assert.calledWith(getHttpsRequest, 'api.guildwars2.com',
            '/v2/account/materials?access_token=' + user.apikey)
        })
    })
    it ('should resolve with correct object', () => {
      return GW2API.getMats(user)
        .then((result) => {
          assert.deepEqual(result, responseObj)
        })
    })
  })

  describe('GW2API.getBank(user)', () => {
    //params/input
    const user = {
      username: 'shinymeta',
      password: 'shinymeta',
      apikey: '58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20',
      id: 1
    }
    //stub
    let getHttpsRequest
    let revert
    //result/output
    let responseObj = [  {
        id: 70718,
        count: 22,
        binding: 'Account'
      },
      {
        id: 49523,
        count: 3,
        binding: 'Account'
      },
      null,
      null  ]
    let response = JSON.stringify(responseObj)

    beforeEach(() => {
      getHttpsRequest = sinon.stub().returns(Promise.resolve(response))
      revert = GW2API.__set__('getHttpsRequest', getHttpsRequest)
    })

    afterEach(() => {
      revert()
    })


    it ('should call httpsRequest to bank api path', () => {
      return GW2API.getBank(user)
        .then((result) => {
          sinon.assert.calledWith(getHttpsRequest, 'api.guildwars2.com',
            '/v2/account/bank?access_token=' + user.apikey)
        })
    })
    it ('should resolve with correct object', () => {
      return GW2API.getBank(user)
        .then((result) => {
          assert.deepEqual(result, responseObj)
        })
    })
  })

  describe('GW2API.getInventories(user)', () => {
    //params/input
    const user = {
      username: 'shinymeta',
      password: 'shinymeta',
      apikey: '58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20',
      id: 1
    }
    //stub
    let getHttpsRequest
    let revert
    //result/output
    let responseObj = [ {
      name: 'Shinymeta',
      bags: [  {
        id: 38013,
        size: 20,
        inventory: [
          {
            id: 73718,
            count: 1,
            binding: 'Account'
          },  {
            id: 19986,
            count: 1,
            charges: 17,
            binding: 'Account'
          },  {
            id: 73481,
            count: 1,
            charges: 17,
            binding: 'Account'
          },  {
            id: 19992,
            count: 6,
            binding: 'Account'
          },
          null
        ]
      },  {
        id: 38013,
        size: 20,
        inventory: [
          null,
          null
        ]
      }  ]
    }]
    let response = JSON.stringify(responseObj)
    let expected = [
      {
        id: 73718,
        count: 1,
        binding: 'Account'
      },  {
        id: 19986,
        count: 1,
        charges: 17,
        binding: 'Account'
      },  {
        id: 73481,
        count: 1,
        charges: 17,
        binding: 'Account'
      },  {
        id: 19992,
        count: 6,
        binding: 'Account'
      },
    ]

    beforeEach(() => {
      getHttpsRequest = sinon.stub().returns(Promise.resolve(response))
      revert = GW2API.__set__('getHttpsRequest', getHttpsRequest)
    })

    afterEach(() => {
      revert()
    })


    it ('should call httpsRequest to characters api path', () => {
      return GW2API.getInventories(user)
        .then((result) => {
          sinon.assert.calledWith(getHttpsRequest, 'api.guildwars2.com',
            '/v2/characters?page=0&access_token=' + user.apikey)
        })
    })
    it ('should resolve with correct object', () => {
      return GW2API.getInventories(user)
        .then((result) => {
          assert.deepEqual(result, expected)
        })
    })
  })

  describe('charactersToInventoryItems(characters)', () => {
    let characters = [ {
      name: 'Shinymeta',
      bags: [  {
        id: 38013,
        size: 20,
        inventory: [
          {
            id: 73718,
            count: 1,
            binding: 'Account'
          },  {
            id: 19986,
            count: 1,
            charges: 17,
            binding: 'Account'
          },  {
            id: 73481,
            count: 1,
            charges: 17,
            binding: 'Account'
          },  {
            id: 19992,
            count: 6,
            binding: 'Account'
          },
          null
        ]
      },  {
        id: 38013,
        size: 20,
        inventory: [
          null,
          null
        ]
      }  ]
    }]
    let expected = [
      {
        id: 73718,
        count: 1,
        binding: 'Account'
      },  {
        id: 19986,
        count: 1,
        charges: 17,
        binding: 'Account'
      },  {
        id: 73481,
        count: 1,
        charges: 17,
        binding: 'Account'
      },  {
        id: 19992,
        count: 6,
        binding: 'Account'
      },
    ]

    it ('should reduce an array of character objects to just items', () => {
      let result = GW2API.__get__('charactersToInventoryItems')(characters)
      assert.deepEqual(result, expected)
    })
  })

  describe('GW2API.getShared(user)', () => {
    //params/input
    const user = {
      username: 'shinymeta',
      password: 'shinymeta',
      apikey: '58468D10-F7BA-234C-963E-A854D0001EC150A288B8-F8F2-4611-A664-C526CE446B20',
      id: 1
    }
    //stub
    let getHttpsRequest
    let revert
    //result/output
    let responseObj = [  {
      id: 70827,
      count: 50,
      binding: 'Account'
      },  {
      id: 72210,
      count: 4,
      binding: 'Account'
    }  ]
    let response = JSON.stringify(responseObj)

    beforeEach(() => {
      getHttpsRequest = sinon.stub().returns(Promise.resolve(response))
      revert = GW2API.__set__('getHttpsRequest', getHttpsRequest)
    })

    afterEach(() => {
      revert()
    })


    it ('should call httpsRequest to shared inventory api path', () => {
      return GW2API.getShared(user)
        .then((result) => {
          sinon.assert.calledWith(getHttpsRequest, 'api.guildwars2.com',
            '/v2/account/inventory?access_token=' + user.apikey)
        })
    })
    it ('should resolve with correct object', () => {
      return GW2API.getShared(user)
        .then((result) => {
          assert.deepEqual(result, responseObj)
        })
    })
  })

})
