




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


module.exports = gw2DB



gw2DB.getActiveRecordByUser = (user_id) => {
  return gw2DB('gw2data_records').where({user_id, status: 'running'})
      .orWhere({user_id, status: 'stopped'})
      .orWhere({user_id, status: 'editing'})
      .orWhere({user_id, status: 'edited'})
      .first()
}


gw2DB.storeStartState = (startState) => {
  //create new record:
  const record = {
    user_id: startState.user_id,
    character_name: startState.character.name,
    character_class: startState.character.class,
    character_level: startState.character.level,
    status: 'running',
    start_time: gw2DB.fn.now(),
  }
  const items = startState.items
  const currencies = startState.currencies

  return gw2DB('gw2data_records')
    .insert(record)
    .then((id) => {
      //store the items and currencies
      return Promise.all([
        insertRecordArrayData(items, 'gw2data_start_items', id),
        insertRecordArrayData(castCurrencyArrayForRecord(currencies), 'gw2data_start_currencies', id),
      ])
    })
    .catch((err) => {
      console.error(err)
    })
}

gw2DB.storeStopState = (end_time, record) => {
  return gw2DB('gw2data_records')
    .where('record_id', record.record_id)
    .update({
      status: 'stopped',
      end_time: new Date(end_time),
    })
    .catch ((err) => {
      console.error(err)
    })
}

gw2DB.storeEndState = (endState, record) => {
  //need to update the record with status: 'editing' and salvage settings
  return Promise.all([
    insertRecordArrayData(endState.items, 'gw2data_end_items', record.record_id),
    insertRecordArrayData(castCurrencyArrayForRecord(endState.currencies),
                'gw2data_end_currencies', record.record_id),
    gw2DB('gw2data_records')
      .where('record_id', record.record_id)
      .update({
        status: 'editing',
        green_salvage: endState.green_salvage,
        yellow_salvage: endState.yellow_salvage,
        magic_find: endState.magic_find
      })
    ])
    .catch ((err) => {
      console.error(err)
    })
}

gw2DB.storeResultState = (resultState, record) => {
  //need to update the record with status: 'editing' and salvage settings
  const castedResultState = castResultStateforDB(resultState)
  return Promise.all([
      insertRecordArrayData(castedResultState.items, 'gw2data_result_items', record.record_id),
      insertRecordArrayData(castedResultState.currencies, 'gw2data_result_currencies', record.record_id),
      gw2DB('gw2data_records')
        .where('record_id', record.record_id)
        .update({status: 'edited'})
    ])
    .catch ((err) => {
      console.error(err)
    })
}

gw2DB.storeFinalState = (finalState, record) => {
  const {method, map, strategy_nickname} = finalState
  const {method_type, key_element} = method
  let key_element_id = '-1'
  if (method_type === 'Currency') {
    key_element_id = key_element.currency_id
  }
  else if (key_element.item_id) {
    key_element_id = key_element.item_id
  }
  return gw2DB('gw2data_records')
    .where('record_id', record.record_id)
    .update({
      status: 'saved',
      method_type: finalState.method.method_type,
      key_element: key_element_id,
      //goldfarming tags, will be null/undefined otherwise
      map,
      strategy_nickname,
      //general equip columns, will be null/undefined otherwise
      upgrade1_rarity: finalState.method.upgrade1_rarity,
      upgrade1_element: finalState.method.upgrade1_element,
      upgrade2_rarity: finalState.method.upgrade2_rarity,
      upgrade2_element: finalState.method.upgrade2_element

    })
    .catch ((err) => {
      console.error(err)
    })
}

gw2DB.cancelRecord = (record) => {
  //just set status to cancelled
  return gw2DB('gw2data_records')
    .where('record_id', record.record_id)
    .update({
      status: 'cancelled'
    })
    .catch ((err) => {
      console.error(err)
    })
}



//
function castResultStateforDB(resultState) {
  return {
    items: resultState.items.map((item) => ({
          binding: item.binding,
          quantity: item.quantity,
          item_id: item.item_id,
          upgrades: (item.upgrades)?item.upgrades.filter((x)=> x !== null).map((x) => x.item_id):null,
        })),
    currencies: resultState.currencies.map((currency) => ({
          quantity: currency.quantity,
          currency_id: currency.currency_id,
        })),
  }
}


//stores the indicated array in the indicated table
function insertRecordArrayData(array, tablename, record_id) {
  let inserts = []
  array.forEach(({...rest}) => {
    inserts.push(gw2DB(tablename)
    .insert({record_id, ...rest}))
  })
  return Promise.all(inserts)
}

function castCurrencyArrayForRecord(currencyArray){
  let newArray = currencyArray.map((currency) => {
    return {
      currency_id: currency.id,
      quantity: currency.value,
    }
  })
  return newArray
}




















gw2DB.getEditedResults = (record_id) => {
  return Promise.all([
    gw2DB('gw2data_result_items').where('record_id', record_id)
      .innerJoin(itemDetailsQuery().as('b'),
          'gw2data_result_items.item_id', 'b.item_id')
          .then(fillUpgradeDetails),
    gw2DB('gw2data_result_currencies').where('record_id', record_id)
      .innerJoin('ref_currencies',
          'gw2data_result_currencies.currency_id', 'ref_currencies.currency_id'),
  ])
  .then((results) => {
    return {
      items: results[0],
      currencies: results[1]
    }
  })
}



gw2DB.getStartEndDifferences = (record_id) => {

  //special query
  //want to join start and end on item_id,
  //where start qty != end qty/ either is null
  //and where record_id


  return Promise.all([
    gw2DB(gw2DB('gw2data_start_items AS a').leftJoin('gw2data_end_items AS b', (join) => {
      // console.log('test')
      // console.trace()
      let test = join
      let test2 = join.on
      join.on('a.item_id', '=', 'b.item_id')
      join.andOn('a.record_id', '=', 'b.record_id')
      join.andOn((join) => {
        join.on('a.upgrades', '=', 'b.upgrades')
        join.orOn((join) => {
          join.onNull('a.upgrades')
          join.onNull('b.upgrades')
        })
      })
    }).select('a.item_id', 'a.binding', 'a.upgrades', gw2DB.raw('(IFNULL(b.quantity, 0) - a.quantity) AS quantity'))
      .whereRaw(
        `a.record_id = ${record_id} AND (b.quantity IS NULL OR a.quantity != b.quantity)`
      )
  
    .union(
  
    gw2DB('gw2data_start_items AS a').rightOuterJoin('gw2data_end_items AS b', (join) => {
      join.on('a.item_id', '=', 'b.item_id')
      join.andOn('a.record_id', '=', 'b.record_id')
      join.andOn((join) => {
        join.on('a.upgrades', '=', 'b.upgrades')
        join.orOn((join) => {
          join.onNull('a.upgrades')
          join.onNull('b.upgrades')
        })
      })
    }).select('b.item_id', 'b.binding', 'b.upgrades', gw2DB.raw('(b.quantity - IFNULL(a.quantity, 0)) AS quantity'))
    .whereRaw(
      `b.record_id = ${record_id} AND a.quantity IS NULL`
    )
    ).as('x'))
    .innerJoin(itemDetailsQuery().as('y'),
        'x.item_id', 'y.item_id')
    .then(fillUpgradeDetails)

    ,
    gw2DB.raw(`
      SELECT * FROM
      (SELECT a.currency_id, (IFNULL(b.quantity, 0) - a.quantity) quantity FROM
        gw2data_start_currencies a
        LEFT JOIN
        gw2data_end_currencies b
        ON (a.currency_id = b.currency_id AND a.record_id = b.record_id)
        WHERE a.record_id = ${record_id}
        AND (b.quantity IS NULL
        OR a.quantity != b.quantity)
      UNION
      SELECT b.currency_id, (b.quantity - IFNULL(a.quantity, 0)) quantity FROM
        gw2data_start_currencies a
        RIGHT OUTER JOIN
        gw2data_end_currencies b
        ON (a.currency_id = b.currency_id AND a.record_id = b.record_id)
        WHERE b.record_id = ${record_id}
        AND a.quantity IS NULL) x
      INNER JOIN
        ref_currencies y
        USING (currency_id)
        ORDER BY quantity ASC
    `)
    .then((rawResponse) => rawResponse[0])

  // return Promise.all([
  //   gw2DB.raw(`
  //     SELECT * FROM
  //     (SELECT a.item_id, a.binding, a.upgrades, (IFNULL(b.quantity, 0) - a.quantity) quantity FROM
  //       gw2data_start_items a
  //       LEFT JOIN
  //       gw2data_end_items b
  //       ON (a.item_id = b.item_id AND a.record_id = b.record_id
  //   			AND (a.upgrades = b.upgrades OR (a.upgrades IS NULL AND b.upgrades IS NULL)))
  //       WHERE a.record_id = ${record_id}
  //       AND (b.quantity IS NULL
  //       OR a.quantity != b.quantity)
  //     UNION
  //     SELECT b.item_id, b.binding, b.upgrades, (b.quantity - IFNULL(a.quantity, 0)) quantity FROM
  //       gw2data_start_items a
  //       RIGHT OUTER JOIN
  //       gw2data_end_items b
  //       ON (a.item_id = b.item_id AND a.record_id = b.record_id
  //   			AND (a.upgrades = b.upgrades OR (a.upgrades IS NULL AND b.upgrades IS NULL)))
  //       WHERE b.record_id = ${record_id}
  //       AND a.quantity IS NULL) x
  //       INNER JOIN
  //         ref_items y
  //         USING (item_id)
  //         ORDER BY quantity ASC
  //     `)
  //
  //     // .then(res => res[0])
  //     .then(fillUpgradeDetails),
  //   gw2DB.raw(`
  //     SELECT * FROM
  //     (SELECT a.currency_id, (IFNULL(b.quantity, 0) - a.quantity) quantity FROM
  //       gw2data_start_currencies a
  //       LEFT JOIN
  //       gw2data_end_currencies b
  //       ON (a.currency_id = b.currency_id AND a.record_id = b.record_id)
  //       WHERE a.record_id = ${record_id}
  //       AND (b.quantity IS NULL
  //       OR a.quantity != b.quantity)
  //     UNION
  //     SELECT b.currency_id, (b.quantity - IFNULL(a.quantity, 0)) quantity FROM
  //       gw2data_start_currencies a
  //       RIGHT OUTER JOIN
  //       gw2data_end_currencies b
  //       ON (a.currency_id = b.currency_id AND a.record_id = b.record_id)
  //       WHERE b.record_id = ${record_id}
  //       AND a.quantity IS NULL) x
  //     INNER JOIN
  //       ref_currencies y
  //       USING (currency_id)
  //       ORDER BY quantity ASC
  //   `)
    // .then(res => res[0])

  ])
  .then((results) => {
    let result = {
      items: results[0],
      currencies: results[1],
    }
    // console.log(JSON.stringify(result,null,2))
    return result
  })
  .catch((err) => {
    console.error(err)
  })
}








function whereInFactory(attribute, values) {
  return (query) => {
    return query.whereIn(attribute, values)
  }
}


function itemDetailsQuery(ids) {
  const filterByIds = (!ids || !ids[0]) ? x => x : whereInFactory('item_id', ids)

  return gw2DB.from(
    filterByIds(gw2DB('ref_items')).as('a')
  ).joinRaw('NATURAL LEFT JOIN ?',
    filterByIds(gw2DB.select(gw2DB.raw('item_id, JSON_ARRAYAGG(value) AS flags'))
      .from ('ref_items_itemflags')
      .innerJoin('ref_itemflags',
        'ref_items_itemflags.itemflag_id', 'ref_itemflags.itemflag_id'))
      .groupBy('item_id')
    .as('b')
  ).joinRaw('NATURAL LEFT JOIN ?',
    filterByIds(gw2DB.select(gw2DB.raw('item_id, JSON_ARRAYAGG(value) AS gametypes'))
      .from ('ref_items_itemgametypes')
      .innerJoin('ref_itemgametypes',
        'ref_items_itemgametypes.itemgametype_id', 'ref_itemgametypes.itemgametype_id'))
      .groupBy('item_id')
    .as('c')
  ).joinRaw('NATURAL LEFT JOIN ?',
    filterByIds(gw2DB.select(gw2DB.raw('item_id, JSON_ARRAYAGG(value) AS restrictions'))
      .from ('ref_items_itemrestrictions')
      .innerJoin('ref_itemrestrictions',
        'ref_items_itemrestrictions.itemrestriction_id', 'ref_itemrestrictions.itemrestriction_id'))
      .groupBy('item_id')
    .as('d')
  )
}

//purpose of function is to get item details of all ids listed in item.upgrades
//then replace upgrades with an array of those item upgrades
function fillUpgradeDetails(items) {
  //first get a list of ids to query
  let upgradeIDs = []
  items.forEach((item) => {
    if (item.upgrades) {
      item.upgrades = item.upgrades.split()
      upgradeIDs.push(item.upgrades)
    }
  })
  if (upgradeIDs.length > 0){
    upgradeIDs = upgradeIDs.flat()
    return gw2DB.getItemDetailsAsObject(upgradeIDs)
    .then((upgradeDetails) => {
      items.forEach((item) => {
        if (item.upgrades) {
          let newUpgrades = []
          item.upgrades.forEach((upgradeID) => {
            newUpgrades.push(upgradeDetails[upgradeID])
          })
          item.upgrades = newUpgrades
        }
      })
    })
    .then(() => {
      return items
    })
  }
  else return items

}

//purpose: to remove items that are the result of free upgrade swapping
//
function compareUpgrades(items) {

}





gw2DB.getItemDetails = (ids) => {
  let idArray
  if (Array.isArray(ids))
    idArray = ids
  else
    idArray = [ids] //if ids was a single id, make it an array for the query


  return itemDetailsQuery(idArray)
}

gw2DB.getItemDetailsAsObject = (ids) => {
  return gw2DB.getItemDetails(ids)
    .then((itemDetailsArray) => {
      const itemDetailsObject = {}
      itemDetailsArray.forEach((item) => {
        itemDetailsObject[item.item_id] = item
      })
      return itemDetailsObject
    })

}




gw2DB.getCurrencyDetails = (ids) => {
  let idArray
  if (Array.isArray(ids))
    idArray = ids
  else
    idArray = [ids] //if ids was a single id, make it an array for the query


  return gw2DB('ref_currencies').whereIn('currency_id', idArray)
}

gw2DB.getCurrencyDetailsAsObject = (ids) => {
  return gw2DB.getCurrencyDetails(ids)
    .then((currencyDetailsArray) => {
      const currencyDetailsObject = {}
      currencyDetailsArray.forEach((currency) => {
        currencyDetailsObject[currency.currency_id] = currency
      })
      return currencyDetailsObject
    })

}




//
// gw2DB.fillItemDetails = (items) => {
//   //if items is actually an array of bags
//   if (items[0] && items[0].inventory){
//     return this.fillBagsWithItemDetails(items)
//   }
//
//   //create indexer and ids array
//   let indexer = {}
//   let ids = []
//   createItemsIndexer(items, indexer, ids)
//
//   //get details from server, then merge them into ids
//   return this.getItemDetailsFromServer(ids)
//     .then((itemDetails) => {
//       return mergeItemDetails(items, itemDetails, indexer)
//     })
// },
//
//
//
// const createItemsIndexer = (items, indexer, ids) => {
//   items.forEach((item, index) => {
//     if (item) {
//       //check if id already in indexer
//       if (!indexer[item.id]) {
//         //add to ids and indexer
//         indexer[item.id] = []
//         ids.push(item.id)
//       }
//       indexer[item.id].push(index)
//     }
//   })
// }
//
// const mergeItemDetails = (items, itemDetails, indexer) => {
//   //go through each itemDetail, and merge it with every item via indexer
//   itemDetails.forEach((itemDetail) => {
//     indexer[itemDetail.item_id].forEach((index) => {
//       Object.assign(items[index], itemDetail)
//     })
//   })
//   return items
// }






























////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
//  UPDATE LOOKUP TABLES FUNCTIONS
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////

//INDEXERs can take in either the value or the ID in [], and return the other
let FLAG_INDEXER = {}, GAMETYPE_INDEXER = {}, RESTRICTION_INDEXER = {}


gw2DB.updateRefTables = function() {

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




////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
//  END OF UPDATE FUNCTION
////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////
