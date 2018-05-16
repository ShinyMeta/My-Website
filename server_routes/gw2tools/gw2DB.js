




//////////////////////////////////
//         REQUIRES
//////////////////////////////////

const knex = require('knex')
const knex_config = require('./knexfile')[process.env.NODE_ENV || 'development']
const axios = require('axios')
const PQueue = require('p-queue')




///////////////////////////////////
///     SETTINGS (CONST)
///////////////////////////////////

const IDS_PER_REQUEST = 200
const API_TIMEOUT_IN_MS = 60000
const MAX_CONCURR_API_CALLS = 50
const MAX_CONCURR_DB_INSERTS = 1000




//////////////////////////////////
//    INSTANCES OF REQUIRES
//////////////////////////////////


const gw2DB = knex(knex_config)

const gw2API = axios.create({
  baseURL: 'https://api.guildwars2.com/v2',
  timeout: API_TIMEOUT_IN_MS
})

const gw2_API_queue = new PQueue({concurrency: MAX_CONCURR_API_CALLS})
const gw2_ref_DB_queue = new PQueue({concurrency: MAX_CONCURR_DB_INSERTS})


//////////////////////////////////
//       GLOBAL VARIABLES
//////////////////////////////////

//INDEXERs can take in either the value or the ID in [], and return the other
let FLAG_INDEXER = {}, GAMETYPE_INDEXER = {}, RESTRICTION_INDEXER = {}


module.exports = gw2DB


////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
//  UPDATE FUNCTION
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////



module.exports.updateRefTables = function() {

  //first truncate the item tables and reset indexers
  FLAG_INDEXER = {}
  GAMETYPE_INDEXER = {}
  RESTRICTION_INDEXER = {}

  return Promise.all([
    gw2DB('ref_currencies').truncate(),
    gw2DB('ref_items').truncate(),
    gw2DB('ref_items_itemflags').truncate(),
    gw2DB('ref_items_itemgametypes').truncate(),
    gw2DB('ref_items_itemrestrictions').truncate()

  //then load the tag tables from database into the indexers
  ]).then(() => {
    loadTagCaches()

  //then get item and currency ids from API into DB
  }).then(() => {
    return Promise.all([
      queueAPIRequest('/items', {}),
      queueAPIRequest('/currencies', {})
    ])

  //then request details for the set number of ids at a time
  //(this happens as part of the handler for the response)
  }).then(() => {
    // these are just confirmation scripts that everything is done
    gw2_API_queue.onIdle()
      .then(() => {
        console.log ('api queue FINISHED@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
        gw2_ref_DB_queue.onIdle()
          .then(() => {
            console.log('DB queue FINISHED@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
          })
      })

  //final script chain error catch
  }).catch((err) => {
      console.error(err)
    })
}



////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
//  END OF UPDATE FUNCTION
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////


// module.exports.updateRefTables()



































//////////////////////////////////////////////
//            LOAD TAG CACHES
//////////////////////////////////////////////


// calls helper function createIndexerFromArrayOfPairs on flags, game types and restrictions
function loadTagCaches() {
  //flags, gametypes and restrictions
  return Promise.all([
    gw2DB('ref_itemflags').then((flags) => {
      createIndexerFromArrayOfPairs(flags, 'itemflag_id', 'value', FLAG_INDEXER)}),
    gw2DB('ref_itemgametypes').then((gametypes) => {
      createIndexerFromArrayOfPairs(gametypes, 'itemgametype_id', 'value', GAMETYPE_INDEXER)}),
    gw2DB('ref_itemrestrictions').then((restrictions) => {
      createIndexerFromArrayOfPairs(restrictions, 'itemrestriction_id', 'value', RESTRICTION_INDEXER)})
  ])
}

// helper function to loadTagCaches
function createIndexerFromArrayOfPairs(arrayOfPairs, nameOfVarX, nameOfVarY, indexer){
  arrayOfPairs.forEach((pair) => {
    indexer[pair[nameOfVarX]] = pair[nameOfVarY]
    indexer[pair[nameOfVarY]] = pair[nameOfVarX]
  })
}



























//////////////////////////////////////////////
//            CALLS TO API
//////////////////////////////////////////////

//queue any API request
function queueAPIRequest(path, params){
  return gw2_API_queue.add(() => gw2API.get(path, {params})

  //then parse response depending on path
    .then((response) => {

      switch (path) {

        case '/items':
          //put each of the 200 items from API into DB
          itemsResponseHandler(response)
          break;

        case '/currencies':
          //for when I do currencies
          currenciesResponseHandler(response)
          break;

        default:
          break;
      }
    })

    //catch here for http error
    .catch((error) => {
      httpErrorHandler(error)

    })
  )
}



//gets the path and params from error.request and queues it
function requeueAPIRequest(errorRequest) {
  let path = errorRequest._options.pathname.substr(3)
  let params = {ids: errorRequest._options.query.substr(4)}
  console.log('requeueing request')
  return queueAPIRequest(path, params)
}


//any error handling goes in here
function httpErrorHandler(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
    console.log('Hey dummy, this wasn\'t supposed to happen')
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log('TIME OUT/NO RESPONSE');
    // console.log(error.request._options)
    requeueAPIRequest(error.request)
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error(error)
  }
}

//what to do with responses from /items
function itemsResponseHandler(response){
  if (!response.data[0].id){
    //this means that you just requested the ids for the first time
    let item_ids = response.data
    let next = []

    while (item_ids.length > 0){
      next = item_ids.splice(0, IDS_PER_REQUEST)
      let params = {ids: next.toString()}

      //add API request to the queue
      queueAPIRequest('/items', params)
    }
    return
  }

  let item_details_list = response.data
  item_details_list.forEach((item) => {
    gw2_ref_DB_queue.add(() => insertItemToDB(item))
  })
}

//what to do with responses from /currencies
function currenciesResponseHandler(response) {
  if (!response.data[0].id){
    //this means it's the first request for ids
    let currency_ids = response.data
    let next = []

    while (currency_ids.length > 0){
      next = currency_ids.splice(0, IDS_PER_REQUEST)
      let params = {ids: next.toString()}

      //add API request to the queue
      queueAPIRequest('/currencies', params)
    }
    return
  }


  //but if this does have data, then do this
  //loop through the currencies, and put them in db
  response.data.forEach((currency) => {
    gw2_ref_DB_queue.add(() => insertCurrencyToDB(currency))
  })
}



































//////////////////////////////////////////////
//            INSERT TO DB
//////////////////////////////////////////////


// takes item object from API
// converts item and fully inserts in DB, returns promise for full completion
function insertItemToDB(item) {
  return Promise.all([
    gw2DB('ref_items')
      .insert(castItemForDB(item)),
    gw2DB('ref_items_itemflags')
      .insert(castTagArrayForDB(item, 'flags', 'itemflag_id', FLAG_INDEXER)),
    gw2DB('ref_items_itemgametypes')
      .insert(castTagArrayForDB(item, 'game_types', 'itemgametype_id', GAMETYPE_INDEXER)),
    gw2DB('ref_items_itemrestrictions')
      .insert(castTagArrayForDB(item, 'restrictions', 'itemrestriction_id', RESTRICTION_INDEXER))
  ]).then (() => {})
}


//helper function, returns object with all correct variable names for DB
function castItemForDB({id, chat_link, name, icon, description, type, rarity,
                        level, vendor_value, default_skin, details}) {
  return {
    item_id: id,
    chat_link,
    name,
    icon,
    description,
    type,
    rarity,
    level,
    vendor_value,
    default_skin,
    details: JSON.stringify(details)
  }
}


// returns array of id pairs, for the specified tag type(i.e. all item flags)
//    item is JSON object from API
//    tagArrayName is the name of the tag variable in API item
//    tagDBName is the column label in DB
//    indexer is the INDEXER object to translate tags to their DB IDs
function castTagArrayForDB(item, tagArrayName, tagDBName, indexer) {
  let result = []
  let array = item[tagArrayName]
  if (array && array.length > 0){
    array.forEach((value) => {
      let next = {item_id: item.id}
      next[tagDBName] = indexer[value]
      result.push(next)
    })
  }
  return result
}




function insertCurrencyToDB(currency) {
  return gw2DB('ref_currencies')
    .insert(castCurrencyForDB(currency))
}

function castCurrencyForDB({id, name, description, order, icon}) {
  let currency = {
    currency_id: id,
    name,
    description,
    currency_order: order,
    icon
  }
  return currency
}
