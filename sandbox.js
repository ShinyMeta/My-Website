const DB = require('./server_routes/gw2tools/gw2DB.js')

console.log('beginning sandbox')

// DB.getTPHistoryForItem(19721, 5)
//   .then((results) => {
//     console.log(results.map(x=> x.sell_price).sort((a,b) => a-b))
//   })

// DB.getTPSummaryForItem(19721, 5)
//   .then((result) => {
//     console.log(result)
//   })


withRunTimeLog(() => {
  return DB.allTPItemIds()
    .then((result) => {
      console.log('stuff')
      return Promise.all(result.map((item) => {
        return Promise.all([
          DB.getTPSummaryForItem(item.item_id, 1),
          // DB.getTPSummaryForItem(item.item_id, 3),
          // DB.getTPSummaryForItem(item.item_id, 7),
          // DB.getTPSummaryForItem(item.item_id, 30),
        ]).then((results) => {
          console.log(results[0].current.item_id)
          return {
            current: results[0].current,
            '1day': results[0],
            '3day': results[1],
            '7day': results[2],
            '30day': results[3],
          }
        })
        .catch((err) => {
          console.error(err)
          // res.status(400)
          // res.json({
          //   error_message: err.message
          // })
        })
      }))
    })
}, 'get all summary')()
  .then(console.log)





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