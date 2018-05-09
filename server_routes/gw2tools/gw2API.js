


const axios = require('axios')


const API_TIMEOUT_IN_MS = 60000

const gw2API = axios.create({
  baseURL: 'http://api.guildwars2.com/v2',
  timeout: API_TIMEOUT_IN_MS
})

module.exports = gw2API


/*
  test access_token:
    D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253

  V2 ROUTES:
    /currencies(?ids=1,2,3...200)
    /items(?ids=1,2,3...200)

    /account/wallet?access_token=
    /account/bank?access_token=
    /characters?access_token=
    /account/inventory?access_token=
    /account/materials?access_token=

    /commerce/exchange/coins?quantity=   coins to gems
    /commerce/exchange/gems?quantity=   gems to coins
    /commerce/prices(?ids=1,2,3...200)

*/



gw2API.currencies = (ids) => {
  let options = {}
  if (ids) {
    options.params = {ids}
  }
  return this.get('/currencies?ids=', options)
}


gw2API.items = (ids) => {
  let options = {}
  if (ids) {
    options.params = {ids}
  }
  return this.get('/items?ids=', options)
}



gw2API.wallet = (access_token) => {
  // https://api.guildwars2.com/v2/account/wallet?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return this.get('/account/wallet?access_token=', {params: {access_token}})
}

gw2API.bank = (access_token) => {
  // https://api.guildwars2.com/v2/account/bank?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return this.get('/account/bank?access_token=', {params: {access_token}})
}

gw2API.characters = (access_token) => {
  // https://api.guildwars2.com/v2/characters?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253&page=0
  return this.get('/characters?access_token=', {params: {access_token, page: 0}})
}

gw2API.sharedInventory = (access_token) => {
  // https://api.guildwars2.com/v2/account/inventory?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return this.get('/account/inventory?access_token=', {params: {access_token}})
}

gw2API.materials = (access_token) => {
  // https://api.guildwars2.com/v2/account/materials?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return this.get('/account/materials?access_token=', {params: {access_token}})
}
