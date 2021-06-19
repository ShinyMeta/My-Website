const client = require('gw2api-client')
const DB = require('./gw2DB.js')



let gw2api = client()

let previousTickListings = null





////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
//   SCHEDULE SECTION
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

const MAX_API_RETRIES = 3
gw2api.fetch.retry((tries, err) => tries <= MAX_API_RETRIES && err.response.status === 500)

const ONE_MINUTE = 60000
  , THREE_MINUTES = 180000
  , FIVE_MINUTES = 300000
  , TEN_MINUTES = 600000

, TIMING_SETTINGS = {
    TPHistory: FIVE_MINUTES,
  }

//comment this line to disable runtime logging
getTPDataAndStoreInHistoryTable = withRunTimeLog(getTPDataAndStoreInHistoryTable, 'TPHistoryUpdate') 


getTPDataAndStoreInHistoryTable()
setInterval(getTPDataAndStoreInHistoryTable, TIMING_SETTINGS.TPHistory)
console.log('TPHistory scheduled')



////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////




function withRunTimeLog(asyncFunctionReturningPromise, funcName = "untitled function"){ 
  return () => {
    const startTime = Date.now()
    return asyncFunctionReturningPromise().then((result) => {
      const endTime = Date.now()
      console.log(`asyncRunTime: ${funcName} completed after ${(endTime-startTime)/1000} seconds.`)
      return result
    })
  }
} 


 
// stores the prices in the history table
function getTPDataAndStoreInHistoryTable() {
  return gw2api.commerce().prices().all()
    .then((prices) => {
      console.log('prices got')
      return gw2api.commerce().listings().all().then((currentListings) => {
        console.log('listings got')
        //compare listings to prev tick
        let velocityData = compareAllListingsToPreviousTick(currentListings)
        console.log(velocityData)
        if (velocityData === null) {
          return prices
        }
        return prices.map((item) => {
          Object.keys(velocityData[item.id]).forEach((velocityProperty) => {
            item[velocityProperty] = velocityData[item.id][velocityProperty]
          })
          return item
        })
      })
    })
    .then(DB.insertTPHistoryWrapperFromApiResponse)
    .catch((err) => {
      console.error(err)
    })
}

//given current listings, compares to and replaces previous tick's listing
//returns indexed array with velocity variables
function compareAllListingsToPreviousTick(currentListings) {
  let result = {}
  if (previousTickListings === null) {
    result = null
  }
  else {
    let currentListingsIndexed = {}
    currentListings.forEach((item) => {
      currentListingsIndexed[item.id] = item
    })
    
    previousTickListings.forEach((prevItem) => {
      result[prevItem.id] = compareListingsOfSingleItem(prevItem, currentListingsIndexed[prevItem.id])
    })
  }

  previousTickListings = currentListings
  return result
}

//compares single item
function compareListingsOfSingleItem(prevItem, currentItem) {
  let result = {
    new_sell_listings: 0,
    sell_listings_pulled: 0,
    sell_listings_sold: 0,
    new_buy_orders: 0,
    buy_orders_pulled: 0,
    buy_orders_filled: 0,
  }

  //iterate through sells and compare
  //SELLS COMPARE
  for (let i = 0,j = 0; i < prevItem.sells.length || j < currentItem.sells.length; ) {
    //{unit_price: 10,000g 00s 01c} is beyond the highest possible listing, i.e. doesn't exist
    let prevItemListing = i < prevItem.sells.length ? prevItem.sells[i] : {unit_price: 100000001}
    let currentItemListing = j < currentItem.sells.length ? currentItem.sells[j] : {unit_price: 100000001}


    let quantityDelta = 0
    //entry exists in previous only
    if (prevItemListing.unit_price < currentItemListing.unit_price) {
      quantityDelta = 0 - prevItemListing.quantity
      i++
    }
    //entry exists in current only
    else if (prevItemListing.unit_price > currentItemListing.unit_price) {
      quantityDelta = currentItemListing.quantity
      j++
    }
    //price exists on both before and after
    else {
      quantityDelta = currentItemListing.quantity - prevItemListing.quantity
      i++, j++
    }

    //new listing
    if (quantityDelta > 0) {
      result.new_sell_listings += quantityDelta
    }
    //either sold or delisted
    if (quantityDelta < 0) {
      //sold
      if (currentItem.sells.length === 0 || prevItemListing.unit_price < currentItem.sells[0].unit_price){
        result.sell_listings_sold += 0-quantityDelta
      }
      //delisted
      else {
        result.sell_listings_pulled += 0-quantityDelta
      }
    }
  }

  // BUYS COMPARE
  for (let i = 0,j = 0; i < prevItem.buys.length || j < currentItem.buys.length; ) {
    //{unit_price: -1} is too low for buy order, i.e. doesn't exist
    let prevItemListing = i < prevItem.buys.length ? prevItem.buys[i] : {unit_price: -1}
    let currentItemListing = j < currentItem.buys.length ? currentItem.buys[j] : {unit_price: -1}


    let quantityDelta = 0
    //entry exists in previous only
    if (prevItemListing.unit_price > currentItemListing.unit_price) {
      quantityDelta = 0 - prevItemListing.quantity
      i++
    }
    //entry exists in current only
    else if (prevItemListing.unit_price < currentItemListing.unit_price) {
      quantityDelta = currentItemListing.quantity
      j++
    }
    //price exists on both before and after
    else {
      quantityDelta = currentItemListing.quantity  - prevItemListing.quantity
      i++, j++
    }

    //new listing
    if (quantityDelta > 0) {
      result.new_buy_orders += quantityDelta
    }
    //either filled order or delisted
    if (quantityDelta < 0) {
      //filled order
      if (currentItem.buys.length === 0 || prevItemListing.unit_price >= currentItem.buys[0].unit_price){
        result.buy_orders_filled += 0-quantityDelta
      }
      //delisted
      else {
        result.buy_orders_pulled += 0-quantityDelta
      }
    }
  }



  return result
}



// daysToSummarize: number of days to go back in DB query to summarize
// dataToSum: either "RAW"(data stored directly from TP) or "ODS"(one-day summary)
function storeSummaryStatistics(daysToSummarize, dataToSum = "RAW") {
  let tableName = 'tp_history'
  if (dataToSum === 'ODS') {
    tableName = 'tp_one_day_moving_summary'
  }

  let beginDate = new Date()
  beginDate.setDate(beginDate.getDate()-daysToSummarize)
  return DB(tableName)
    .where('timestamp', '>', beginDate)
    .then((tableRows) => {
      let rowsByID = {}
      tableRows.forEach((row) => {
        if (!rowsByID[row.item_id]) {
          rowsByID[row.item_id] = []
        }
        rowsByID[row.item_id].push(row)
      })
      return Object.keys(rowsByID).map((item_id) => {
        let sellsList = itemRows[item_id].map(x => x.sell_price)
        let buysList = itemRows[item_id].map(x => x.buy_price)

        return itemRows[item_id].reduce((acc, curr) => {
          acc.new_sell_listings += curr.new_sell_listings,
          acc.sell_listings_pulled += curr.sell_listings_pulled,
          acc.sell_listings_sold += curr.sell_listings_sold,
          acc.new_buy_orders += curr.new_buy_orders,
          acc.buy_orders_pulled += curr.buy_orders_pulled,
          acc.buy_orders_filled += curr.buy_orders_filled
          return acc
        },{
          item_id,
          timestamp: new Date(),

          sell_mean: mean(sellsList),
          sell_median: median(sellsList),
          sell_quartile_1: quartile1(sellsList),
          sell_quartile_3: quartile3(sellsList),
          buy_mean: mean(buysList),
          buy_median: median(buysList),
          buy_quartile_1: quartile1(buysList),
          buy_quartile_3: quartile3(buysList),

          new_sell_listings: 0,
          sell_listings_pulled: 0,
          sell_listings_sold: 0,
          new_buy_orders: 0,
          buy_orders_pulled: 0,
          buy_orders_filled: 0,
        })
      })
    })
}



function mean(numArray) {
  return numArray.reduce((acc, curr) => acc+curr, 0)/numArray.length
}

function median(numArray) {
  const count = numArray.length
  numArray = numArray.sort((a, b) => a-b)
  if (count % 2 === 1) {
    return numArray[(count-1)/2]
  }
  else {
    return (numArray[count/2]+numArray[count/2-1])/2
  }
}

function quartile1(numArray) {
  const count = numArray.length
  numArray = numArray.sort((a, b) => a-b)
  if ((count+1) % 4 === 0) {
    return numArray[(count+1)/4-1]
  }
  else {
    return (numArray[Math.floor((count+1)/4)]+numArray[Math.floor((count+1)/4)-1])/2
  }
}

function quartile3(numArray) {
  const count = numArray.length
  numArray = numArray.sort((a, b) => a-b)
  if ((count+1) % 4 === 0) {
    return numArray[(count+1)/4-1]
  }
  else {
    return (numArray[Math.floor((count+1)*3/4)]+numArray[Math.floor((count+1)*3/4)-1])/2
  }
}
























