

//call this by :
//const gw2dataReport = require gw2dataReport(DB)

export default class gw2dataReportBuilder {
  constructor(DB) {
    this.DB = DB
    // this.indexer = {
    //   items: {},
    //   currencies: {}
    // }
    // this.reportTree = {
    //   farms: {}
    // }
  }

  //function that takes in a map and method name, and returns a farm report object
  getFarmReport(map, strategy_nickname) {
    const report_obj = {}

    //first get all of the records from the records table
    return this.DB('gw2data_records').where({map, strategy_nickname, status: 'saved'})
      .then((records) => {
        report_obj.records = records
        //ok, for each record, need to get the item and currency data
        let getAllItemCurrencyData = []
        records.forEach((record) => {
          getAllItemCurrencyData.push(
            this.DB('gw2data_result_items')
              .where({record_id: record.record_id})
              .then((items)       => { record.items = items }),
            this.DB('gw2data_result_currencies')
              .where({record_id: record.record_id})
              .then((currencies)  => { record.currencies = currencies })
          )
        })
        // console.log('beep1')
        return Promise.all(getAllItemCurrencyData)
          .catch((err) => console.error(err))
      })





      //need to fill the indexer with item and currency data
      .then(() => {
        const indexer = {
          item_ids: [],
          currency_ids: [],
          items: {},
          currencies: {},
          TP_item_ids: [],
        }
        report_obj.indexer = indexer

        report_obj.records.forEach((record) => {
          record.items.forEach((item) => {
            if (!indexer[item.item_id]){
              // indexer.items[item.item_id] = {}
              indexer.item_ids.push(item.item_id)
            }
          })
          record.currencies.forEach((currency) => {
            if (!indexer[currency.currency_id]){
              // indexer.currencies[currency.currency_id] = {}
              indexer.currency_ids.push(currency.currency_id)
            }
          })
        })




        //now that we have a list of all the items and currencies, let's add details
        return Promise.all([
          this.DB.getItemDetailsAsObject(indexer.item_ids)
            .then(items => indexer.items = items),
          this.DB.getCurrencyDetailsAsObject(indexer.currency_ids)
            .then((currencies) => {indexer.currencies = currencies})
        ])
      })




      //now that we have all of the details, we need to set the choice options

      .then(() => {
        // console.log('beep2.1')
        report_obj.indexer.item_ids.forEach((item_id) => {
          // console.log(item_id)
          const item = report_obj.indexer.items[item_id]
          // console.log(report_obj.indexer.items)
          item.choices = []
          //check if the item id has binding, to see if it can be sold on TP
          const tradeable = !(doesItemContainFlag(item, 'SoulbindOnAcquire') ||
                              doesItemContainFlag(item, 'AccountBound'))
          if (tradeable) {
            item.choices.push('Trading Post')
            //keep track of TP item ids, so client can update the report
            report_obj.indexer.TP_item_ids.push(item_id)
          }

          const vendorable = !doesItemContainFlag(item, 'NoSell')
          if (vendorable) { item.choices.push('Sell to NPC Vendor') }

          //more conditions here, container, etc.
          if (item.choices.length === 0) { item.choices.push('None') }
        })
        // console.log('beep3')
        // console.log(report_obj)

        //ok, indexer items have choices now
        return report_obj

        //now when the client gets this object, they should have everything they need
        //consolidate records into one array of items with qtys
        //request TP data for indexer TP ids, slot that data into the items with those ids
        //pass through the indexer item_ids and set a default "choice" based on best value
        //when displaying the report, can ask the indexer for the value of that item directly


      })
  }




  //function that returns the big report object with both tree and indexer

}

function doesItemContainFlag(item, flag) {
  const flags = JSON.parse(item.flags)
  if (flags)
    return flags.find(f => f === flag)
  else
  return false
}
