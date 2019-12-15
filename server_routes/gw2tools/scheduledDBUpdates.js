const client = require('gw2api-client')
const DB = require('./gw2DB.js')



let gw2api = client()







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
console.log('TPHistory scheduled')


setInterval(getTPDataAndStoreInHistoryTable, TIMING_SETTINGS.TPHistory)




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




function getTPDataAndStoreInHistoryTable() {
  return gw2api.commerce().prices().all()
    .then(DB.insertTPHistoryWrapperFromApiResponse)
    .catch((err) => {
      console.error(err)
    })
}



































