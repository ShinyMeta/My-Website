

import axios from 'axios'


module.exports = {

  getItemDetails(ids) {
    return axios.get('/gw2data/itemDetails', {params: {ids: ids.toString()}})
      .then((res) => {
        return res.data
      })
  },

  fillItemDetails(items) {
    //if items is actually an array of bags
    if (items[0] && items[0].inventory){
      return this.fillBagsWithItemDetails(items)
    }

    //create indexer and ids array
    let indexer = {}
    let ids = []
    createItemsIndexer(items, indexer, ids)

    //get details from server, then merge them into ids
    return this.getItemDetails(ids)
      .then((itemDetails) => {
        return mergeItemDetails(items, itemDetails, indexer)
      })
  },




  fillBagsWithItemDetails(bags)  {
    let indexer = {}
    let ids = []
    createBagsIndexer(bags, indexer, ids)

    //get details from server, then merge them into ids
    return this.getItemDetails(ids)
      .then((itemDetails) => {
        return mergeBagDetails(bags, itemDetails, indexer)
      })
  }


}




const createItemsIndexer = (items, indexer, ids) => {
  items.forEach((item, index) => {
    if (item) {
      //check if id already in indexer
      if (!indexer[item.id]) {
        //add to ids and indexer
        indexer[item.id] = []
        ids.push(item.id)
      }
      indexer[item.id].push(index)
    }
  })
}

const mergeItemDetails = (items, itemDetails, indexer) => {
  //go through each itemDetail, and merge it with every item via indexer
  itemDetails.forEach((itemDetail) => {
    indexer[itemDetail.item_id].forEach((index) => {
      Object.assign(items[index], itemDetail)
    })
  })
  return items
}






const createBagsIndexer = (bags, indexer, ids) => {
  bags.forEach((bag, bag_index) => {
    if (bag) {
      bag.inventory.forEach((item, item_index) => {
        if (item) {
          //look if item id already indexed
          if (!indexer[item.id]) {
            //create the index and add id
            indexer[item.id] = []
            ids.push(item.id)
          }
          //add another index
          indexer[item.id].push({bag_index, item_index})

        }
      })
    }
  })
}

const mergeBagDetails = (bags, itemDetails, indexer) => {
  //for each item detail, find it in the indexer and merge with each of the items in teh bags
  itemDetails.forEach((itemDetail) => {
    indexer[itemDetail.item_id].forEach(({bag_index, item_index}) => {
      Object.assign(bags[bag_index].inventory[item_index], itemDetail)
    })
  })
  return bags
}
