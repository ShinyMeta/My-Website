


const axios = require('axios')


const API_TIMEOUT_IN_MS = 60000

const GW2API = axios.create({
  baseURL: 'https://api.guildwars2.com/v2',
  timeout: API_TIMEOUT_IN_MS
})

module.exports = GW2API


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



GW2API.currencies = (ids) => {
  let options = {}
  if (ids) {
    options.params = {ids}
  }
  return GW2API.get('/currencies', options)
    .then((res) => {
      return res.data
    })
}


GW2API.items = (ids) => {
  let options = {}
  if (ids) {
    options.params = {ids}
  }
  return GW2API.get('/items', options)
    .then((res) => {
      return res.data
    })
}



GW2API.apikeyInfo = (access_token) => {
  // https://api.guildwars2.com/v2/tokeninfo?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return GW2API.get('/tokeninfo', {params: {access_token}})
    .then((res) => {
      return res.data
    })
}



GW2API.wallet = (access_token) => {
  // https://api.guildwars2.com/v2/account/wallet?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return GW2API.get('/account/wallet', {params: {access_token}})
    .then((res) => {
      return res.data
    })
}

GW2API.bank = (access_token) => {
  // https://api.guildwars2.com/v2/account/bank?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return GW2API.get('/account/bank', {params: {access_token}})
    .then((res) => {
      return res.data
    })
}

GW2API.characters = (access_token, requestDetails) => {
  // https://api.guildwars2.com/v2/characters?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253&page=0
  if (requestDetails) {return GW2API.get('/characters', {params: {access_token, page: 0}})
                        .then((res) => {
                          return res.data
                        })}
  else                {return GW2API.get('/characters', {params: {access_token}})
                        .then((res) => {
                          return res.data
                        })}
}

GW2API.character = (access_token, character) => {
  // https://api.guildwars2.com/v2/characters/Cinderred?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return GW2API.get('/characters/' + character, {params:{access_token}})
    .then((res) => {
      return res.data
    })
}

GW2API.sharedInventory = (access_token) => {
  // https://api.guildwars2.com/v2/account/inventory?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return GW2API.get('/account/inventory', {params: {access_token}})
    .then((res) => {
      return res.data
    })
}

GW2API.materials = (access_token) => {
  // https://api.guildwars2.com/v2/account/materials?access_token=D2B5389F-F40A-4547-9D2C-FAC66DACEB63374FC165-8917-4A24-9DB0-74602CBF4253
  return GW2API.get('/account/materials', {params: {access_token}})
    .then((res) => {
      return res.data
    })
}



/*//////////////////////////////////////////////////////

    CUSTOM API FUNCTIONS

//////////////////////////////////////////////////////*/



GW2API.fullAccountState = (apikey) => {
  let itemIndexer = {}
  let result = {
    items: [],
    currencies: [],
  }

  return Promise.all([
    GW2API.wallet(apikey),
    GW2API.allCharacterItems(apikey),
    GW2API.bank(apikey),
    GW2API.sharedInventory(apikey),
    GW2API.materials(apikey),
  ]).then((results) => {
    //wallet
    result.currencies = results[0]
    //character inventories
    addItemsToFullState(results[1], result.items, itemIndexer)
    //bank
    addItemsToFullState(results[2], result.items, itemIndexer)
    //shared inventory
    addItemsToFullState(results[3], result.items, itemIndexer)
    //material storage
    addItemsToFullState(results[4], result.items, itemIndexer)

    return result
  })

  /*
  currencies = api.getwallet

  items = api.getcharacter's inventories + getshared inventories + get bank + get material storage
  //use indexer to combine like value types



  */


}

GW2API.allCharacterItems = (apikey) => {
  let items = []
  return GW2API.characters(apikey, true)
    .then((characters) => {
      return bagsToItems(charactersToBags(characters))
    })
}














GW2API.characterBags = (apikey, character) => {
  return GW2API.character(apikey, character)
    .then((character) => {
      return character.bags
    })
}

//this returns just an array of the items, no bag data, but keeping empty item slots
GW2API.characterInventory = (apikey, character) => {
  return GW2API.characterBags(apikey, character)
    .then((bags) => {
      return bagsToInventory(bags)
    })
}
//this returns an array of items WITHOUT empty slots
GW2API.characterItems = (apikey, character) => {
  return GW2API.characterBags(apikey, character)
    .then((bags) => {

      return bagsToItems(bags)
    })
}








///////////////////////////////////////////
//    HELPER FUNCTIONS (don't export)
///////////////////////////////////////////


function addItemsToFullState (newItems, fullStateItems, indexer) {
  newItems.forEach((item) => {
    if (!item) {
      //check for null
    } else if (indexer[item.id] || indexer[item.id] === 0) {
      //we've added this item id already, so we can look it up and add the count
      fullStateItems[indexer[item.id]].quantity += item.count
    } else {
      //new item.id, add to full state and indexer
      indexer[item.id] = fullStateItems.length
      let itemFormattedForDB = {
        item_id: item.id,
        quantity: item.count,
        binding: item.binding
      }
      fullStateItems.push(itemFormattedForDB)
    }

  })

}



function charactersToBags (characters) {
  let bags = []
  characters.forEach((character) => {
    character.bags.forEach((bag) => {
      bags.push(bag)
    })
  })
  return bags
}



//will include empty slots in array
function bagsToInventory (bags) {
  let inventory = []

  bags.forEach((bag) => {
    if (bag) {
      bag.inventory.forEach((item) => {
        inventory.push(item)
      })
    }
  })
  return inventory
}

// will EXCLUDE empty slots in result
function bagsToItems (bags) {
  let items = []

  bags.forEach((bag) => {
    if (bag) {
      bag.inventory.forEach((item) => {
        if (item) { items.push(item) }
      })
    }
  })
  return items
}
