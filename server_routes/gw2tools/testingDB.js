
const DB = require('./gw2DB.js')





DB.getEditedResults(16)
  .then((result) => {
    console.log(result.items)
    console.log(result.currencies)
  })

// const stop_time = Date.now()
// const record_id = 16
// DB.storeStopState(new Date(stop_time), record_id)
//   .then (() => {console.log('did it work?')})



// console.log(DB.testNow())
//
// const startingState = {
//   user_id: 4,
//   character: {
//     name: 'shiny',
//     class: 'ranger',
//     level: 80
//   },
// }
//
// DB.storeStartingState(startingState)
//
// const record = {
//   user_id: startingState.user_id,
//   character_name: startingState.character.name,
//   character_class: startingState.character.class,
//   character_level: startingState.character.level,
//   status: 'running',
//   start_time: DB.fn.now(),
// }
//
// DB('gw2data_records')
//   .insert(record)
//   .then((id) => {
//   })
//   .catch((err) => {
//     console.error(err)
//   })
//


//
// DB.getItemDetails()
//   .whereIn('item_id', [78954,78988,78754])
//   .then((results) => {
//     console.log(results)
//   })
