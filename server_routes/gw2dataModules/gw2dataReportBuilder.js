

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


  fetchRecords(method_type, method_params, filters){
    method_params.status = 'saved'

    return this.DB('gw2data_records').where(method_params)
      .then((records) => {
        //ok, for each record, need to get the item and currency data
        let getAllItemCurrencyData = []
        records.forEach((record) => {
          getAllItemCurrencyData.push(
            this.DB.select('item_id', 'quantity', 'binding').from('gw2data_result_items')
              .where({record_id: record.record_id})
              .then((items)       => { record.items = items }),
            this.DB.select('currency_id', 'quantity').from('gw2data_result_currencies')
              .where({record_id: record.record_id})
              .then((currencies)  => { record.currencies = currencies })
          )
        })
        // console.log('beep1')
        return Promise.all(getAllItemCurrencyData)
          .then(() => records)
      })
  }

  collateRecords(records) {
    if (!records[0]) {
      return null
    }

    const collated = {
      total_time: 0,
      key_element: records[0].key_element,
      method_type: records[0].method_type,
      items: {},
      currencies: {}
    }

    records.forEach((record) => {
      const duration = Date.parse(record.end_time) - Date.parse(record.start_time)
      collated.total_time += duration

      //collate items
      record.items.forEach((item) => {
        if (collated.items[item.item_id]){
          collated.items[item.item_id].quantity += item.quantity
        } else {
          collated.items[item.item_id] = item
        }
      })

      //collate currencies
      record.currencies.forEach((currency) => {
        if (collated.currencies[currency.currency_id]){
          collated.currencies[currency.currency_id].quantity += currency.quantity
        } else {
          collated.currencies[currency.currency_id] = currency
        }
      })
    })

    return collated
  }

  //returns just the choice link to new nodes without resultOf
  collatedToChoiceTree({total_time, key_element, method_type, items, currencies}) {
    const choice_tree = {
      choice,
      parent_id: key_element,
    }

    const choice = {
      method_type: method_type,
      value: null, //null until set
      quantity: 0, //for reporting how much data was used on this choice
      dependsOn: [], //links to other nodes
    }

    // root node is key element, get info
    switch(method_type){
      case 'Farming': //qty = time
        choice.quantity = total_time/3600000
        break
      case 'Currency':
        choice.quantity = 0 - currencies[key_element].quantity // negate the quantity, since it's on the other side of equation
        break
      default:
        choice.quantity = 0 - items[key_element].quantity
        break
    }

    // dependsOn
    // add items and currency nodes to dependsOn
    // if this is the key elemenent, skip
    // make new node
    // add resultOf to each child node
    // divide qty by key ele qty when adding child nodes
    items.forEach((item) => {
          const newNode = {
            type: 'item',
            id: item.item_id,
            choices: {},
            resultOf: [ ],
          }
          choice.dependsOn.push({
            quantity: item.quantity/choice.quantity,
            node: newNode,
          })
    })
    currencies.forEach((currency) => {
          const newNode = {
            type: 'currency',
            id: currency.currency_id,
            choices: {},
            resultOf: [ ]
          }
          choice.dependsOn.push({
            quantity: currency.quantity/choice.quantity,
            node: newNode
          })
    })


    return choice_tree
  }

  // USE 'collatedToChoiceTree' INSTEAD - returns a report object with one choice under root, and no sub-choices
  collatedToNodes({total_time, key_element, method_type, items, currencies}) {
    const nodes = {
      root,
      items: {},
      currencies: {},
    }
    const root = { //API info added later
          type: null, //time, item or currency
          id: -1, //-1 if time, item or curr id
          choices: {}, //contains choice items, which link to other nodes
          //selected choice set later
          resultOf: [], //list of (node,choice) pairs that depend on this node, for efficient updating
        }
    root.choices[method_type] = {
      method_type: method_type,
      value: null, //null until set
      quantity: 0, //for reporting how much data was used on this choice
      dependsOn: [], //for calculating value
    }
    const root_choice = root.choices[method_type]

    // root node is key element, get info
    switch(method_type){
      case 'Farming': //qty = time
        root.type = 'time'
        root_choice.quantity = total_time/3600000
        break
      case 'Currency':
        root.type = 'currency'
        root.id = currencies[key_element].currency_id
        root_choice.quantity = 0 - currencies[key_element].quantity // negate the quantity, since it's on the other side of equation
        nodes.currencies[root.id] = root
        break
      default:
        root.type = 'item'
        root.id = items[key_element].item_id
        root_choice.quantity = 0 - items[key_element].quantity
        nodes.items[root.id] = root
        break
    }

    // dependsOn
    // add items and currency nodes to dependsOn
    // if this is the key elemenent, skip
    // make new node
    // add resultOf to each child node
    // divide qty by key ele qty when adding child nodes
    items.forEach((item) => {
          if (root.type === 'item' && item.item_id === root.id) return

          const newNode = {
            type: 'item',
            id: item.item_id,
            choices: {},
            resultOf: [ {node: root, choice: method_type} ],
          }
          nodes.items[newNode.id] = newNode
          root_choice.dependsOn.push({
            quantity: item.quantity/root_choice.quantity,
            node: newNode,
          })
    })
    currencies.forEach((currency) => {
          if (root.type === 'currency' && currency.currency_id === root.id) return

          const newNode = {
            type: 'currency',
            id: currency.currency_id,
            choices: {},
            resultOf: [ {node: root, choice: method_type} ]
          }
          nodes.currencies[newNode.id] = newNode
          root_choice.dependsOn.push({
            quantity: currency.quantity/root_choice.quantity,
            node: newNode
          })
    })


    return nodes
  }

  //usually only be called after constructing the full node net,
  addDetailsToNodes(nodes) {
    //create arrays of both currency and item ids
    const item_ids = Object.keys(nodes.items)
    const currency_ids = Object.keys(nodes.currencies)

    const fetchDetails = [
      this.DB.getItemDetails(item_ids)
        .then((item_details) => {
          item_details.forEach((item_detail) => {
            Object.assign(nodes.items[item_detail.item_id], item_detail)
          })
        }),
      this.DB.getCurrencyDetails(currency_ids)
        .then((currency_details) => {
          currency_details.forEach((currency_detail) => {
            Object.assign(nodes.currencies[currency_detail.currency_id], currency_detail)
          })
        }),
    ]
    return Promise.all(fetchDetails)
      .then(() => nodes)

  }



  fetchChoice(method_type, method_params, filters){
    return this.fetchRecords(method_type, method_params, filters)
      .then(this.collateRecords)
      .then(this.collatedToChoiceTree)
  }


  //returns the methods that have records for the node
  fetchChoices(node, filters) {
    return this.DB.select('method_type').from('gw2data_records')
      .where({key_element: node.id})
      //where filters
      .groupBy('method_type')
      .then((method_types) => {
        return {node, method_types}
      })
    // node.choices = [
    //   {name: 'None', value: 0}
    // ]
    // //check if the node id has binding, to see if it can be sold on TP
    // const tradeable = !(doesItemContainFlag(node, 'SoulbindOnAcquire') ||
    //                     doesItemContainFlag(node, 'AccountBound'))
    // if (tradeable) {
    //   node.choices.push({name: 'Trading Post', value: {buy:0, sell:0} })
    // }
    //
    // const vendorable = !doesItemContainFlag(node, 'NoSell')
    // if (vendorable) {
    //   node.choices.push({name: 'Sell to NPC Vendor', value: node.vendor_value})
    // }
    //
    // return this.addComplexItemChoices(node, filters)

  }




  // addComplexItemChoices(item, filters){
  //   //Check for complex choices
  //   return this.DB.select('method_type').from('gw2data_records')
  //     .where({key_element: item.item_id})
  //     //where filters
  //     .groupBy('method_type')
  //     .then((methods) => {
  //       const fetchAllMethods = []
  //       methods.forEach((method) => {
  //               if (method === 'Currency') return
  //               //get a method report and add it to choices
  //               fetchAllMethods.push(this.fetchRecords(method, null, filters)
  //               .then(this.collateRecords)
  //               .then((collated) => {
  //
  //                 item.choices.push({
  //                   name: method,
  //                   value: 0,
  //                   dependsOn: {
  //                     items: collated.items,
  //                     currencies: collated.currencies
  //                   }
  //                 })
  //               }))
  //       })
  //       return Promise.all(fetchAllMethods)
  //     })
  // }

  //single choice report
  buildReport(method_type, method_params, filters){
    const report_object = {
      nodes: {
        root,
        items: {},
        currencies: {},
      },
      TP_ids: []
    }
    const root = { //API info added later
      type: null, //time, item or currency
      id: method_params.key_element ? method_params.key_element : -1, //-1 if time, item or curr id
      choices: {}, //contains choice items, which link to other nodes
      //selected choice set later
      resultOf: [], //list of (node,choice) pairs that depend on this node, for efficient updating
    }
    switch (method_type) {
      case 'Farming': root.type = 'time'; break
      case 'Currency': root.type = 'currency'; break
      default: root.type = 'item'; break
    }


    // queues are what drive the report builder
    // when a new node is created, add it to new_node_queue
    // do a batch fetch on gw2data records to find choices for the new nodes
    const new_node_queue = []
    let new_node_fetching = false
    // then, add them to fetch choices queue
    // when both queues empty, that means that all done
    const fetch_choice_queue = []

    fetch_choice_queue.push(
      this.fetchChoice(method_type, method_params, filters)
        .then ((choice) => {
          root.choices[method_type] = choice
          addDependsOnToReportObject(choice.dependsOn, report_object, new_node_queue)
        })
        .then(() => {
          fetch_choice_queue.pop()
          return checkQueues(new_node_queue, new_node_fetching, fetch_choice_queue)
        })
    )



    // //get collated base report data
    // this.fetchRecords(method_type, {map, strategy_nickname}, filters)
    //   .then(this.collateRecords)
    //   .then(this.addDetailsToCollated)
    //   .then((collated) => {
    //     report_object.time = collated.time
    //     report_object.key_element = collated.key_element
    //
    //     //for each item, get all choices, then add to table_data
    //     Object.entries(collated.items).forEach(([item_id, item]) => {
    //
    //     })
    //   })
  }



  old_buildReport(method_type, {map, strategy_nickname}, filters){
    const report_object = {
      time: 0,
      key_element: -1,
      table_data: {
      },
      TP_ids: []
    }

    // track indexes for table data seen.item[id] = index
    const seen = {
      item: {},
      currency: {}
    }

    //get collated base report data
    this.fetchRecords(method_type, {map, strategy_nickname}, filters)
      .then(this.collateRecords)
      .then(this.addDetailsToCollated)
      .then((collated) => {
        report_object.time = collated.time
        report_object.key_element = collated.key_element

        //for each item, get all choices, then add to table_data
        Object.entries(collated.items).forEach(([item_id, item]) => {

        })
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

function findNodeInReportObject(node, report_object){
  if (node.type === 'item') {
    return report_object.items[node.id]
  }
  else {
    return report_object.currencies[node.id]
  }
}

function addNodeToReportObject(newNode, report_object, new_node_queue) {
  if (newNode.type === 'item') {
    report_object.items[newNode.id] = newNode
  }
  else {
    report_object.currencies[newNode.id] = newNode
  }
  new_node_queue.push(newNode)
}


function addDependsOnToReportObject(dependsOn, report_object, new_node_queue){
  dependsOn.forEach((dependant) => {
    //look for node in report_object
    const foundNode = findNodeInReportObject(dependant.node, report_object)
    if (foundNode){
      dependant.node = foundNode
    }
    else {
      addNodeToReportObject(dependant.node, report_object, new_node_queue)
    }
  })
}

function checkQueues(new_node_queue, new_node_fetching, fetch_choice_queue) {
  const areDone = (new_node_queue.length === 0) && !new_node_fetching &&
      (fetch_choice_queue.length === 0)
}
