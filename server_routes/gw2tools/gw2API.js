


const axios = require('axios')


const API_TIMEOUT_IN_MS = 60000

const gw2API = axios.create({
  baseURL: 'https://api.guildwars2.com/v2',
  timeout: API_TIMEOUT_IN_MS
})

module.exports = gw2API


/*
  test access_token:
    D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253

  V2 ROUTES:
    /currencies(?ids=1,2,3...200)
    /items(?ids=1,2,3...200)

    /tokeninfo?access_token=

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
  return gw2API.get('/currencies', options)
}


gw2API.items = (ids) => {
  let options = {}
  if (ids) {
    options.params = {ids}
  }
  return gw2API.get('/items', options)
}



gw2API.apikeyInfo = (access_token) => {
  // https://api.guildwars2.com/v2/tokeninfo?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return gw2API.get('/tokeninfo', {params: {access_token}})
}



gw2API.wallet = (access_token) => {
  // https://api.guildwars2.com/v2/account/wallet?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return gw2API.get('/account/wallet', {params: {access_token}})
}

gw2API.bank = (access_token) => {
  // https://api.guildwars2.com/v2/account/bank?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return gw2API.get('/account/bank', {params: {access_token}})
}

gw2API.characters = (access_token, requestDetails) => {
  // https://api.guildwars2.com/v2/characters?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253&page=0
  if (requestDetails) {return gw2API.get('/characters', {params: {access_token, page: 0}})}
  else                {return gw2API.get('/characters', {params: {access_token}})}
}

gw2API.character = (access_token, character) => {
  // https://api.guildwars2.com/v2/characters/Cinderred?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return gw2API.get('/characters/' + character, {params:{access_token}})
}

gw2API.sharedInventory = (access_token) => {
  // https://api.guildwars2.com/v2/account/inventory?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return gw2API.get('/account/inventory', {params: {access_token}})
}

gw2API.materials = (access_token) => {
  // https://api.guildwars2.com/v2/account/materials?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return gw2API.get('/account/materials', {params: {access_token}})
}



/*//////////////////////////////////////////////////////

    CUSTOM FUNCTIONS

//////////////////////////////////////////////////////*/

gw2API.characterBags = (apikey, character) => {
  return gw2API.character(apikey, character)
    .then((res) => {
      return res.data.bags
    })
}

//this returns just an array of the items, no bag data, but keeping empty item slots
gw2API.characterInventory = (apikey, character) => {
  return gw2API.characterBags(apikey, character)
    .then((bags) => {
      let inventory = []
      //loop through each bag slot
      for (let bagIndex = 0; bagIndex < bags.length; bagIndex++){
        //skip null bags
        if (bags[bagIndex]) {
          //loop through each item slot
          let bag = bags[bagIndex].inventory
          for (let itemIndex = 0; itemIndex< bag.length; itemIndex++) {
            //DON'T skip null item slots
            inventory.push(bag[itemIndex])
          }
        }
      }

      return inventory
    })
}
//this returns an array of items WITHOUT empty slots
gw2API.characterItems = (apikey, character) => {
  return gw2API.characterBags(apikey, character)
    .then((bags) => {
      let items = []
      //loop through each bag slot
      for (let bagIndex = 0; bagIndex < bags.length; bagIndex++){
        //skip null bags
        if (bags[bagIndex]) {
          //loop through each item slot
          let bag = bags[bagIndex].inventory
          for (let itemIndex = 0; itemIndex< bag.length; itemIndex++) {
            //SKIP null item slots
            if (bag[itemIndex]){
              items.push(bag[itemIndex])
            }
          }
        }
      }

      return items
    })
}
