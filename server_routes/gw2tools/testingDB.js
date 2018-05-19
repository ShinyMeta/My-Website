
let DB = require('./gw2DB.js')




DB.getItemDetails([78954,78988,78754])
  .then((results) => {
    console.log(results)
  })
