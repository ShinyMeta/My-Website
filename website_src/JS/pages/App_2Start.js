import axios from 'axios'
import React from 'react';

import GW2API from '../../../server_routes/gw2tools/gw2API.js'
import Item from '../components/Item.js'


export default class Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedCharacterInventory: null,
      firstFiveUpdated: false,
      newItemOrder: null,
      reorderType: null, //"allNull" or "swap"
    }
  }

    ////////////////////
    // REACT METHODS
    ///////////////////

  componentDidMount() {
    //query API for selected chars items
    this.getItemsFromAPI()
  }




  ////////////////////
  // EVENT HANDLERS
  ///////////////////

  onRefreshInventoryClick(e) {
    // reset state, then
    this.setState(() => {
      return {
        selectedCharacterInventory: null,
        firstFiveUpdated: false,
        newItemOrder: null,
        reorderType: null,
      }
    })
    // get items from API again
    this.getItemsFromAPI()
  }

  onReorderClick(e) {
    this.rearrangeFirstFive()
  }



  ////////////////////
  // HELPER METHODS
  ///////////////////

  getItemsFromAPI() {
    GW2API.characterInventory(this.props.user.apikey, this.props.selectedCharacter)
      .then((inventory) => {
        this.setState(() => {return {selectedCharacterInventory: inventory}},
        () => {
          this.getFirstFiveDetails()
          this.rearrangeFirstFive()
        })
      })
  }

  //this gets the details of the items from the server, overwriting the
  getFirstFiveDetails() {
    let item_ids = []
    let id_indexer = {}
    for (let i = 0; i < 5; i++) {
      const item = this.state.selectedCharacterInventory[i]
      //skip null
      if (item){
        //save the indxexer of the id in indexer
        id_indexer[item.id] = i
        item_ids.push(item.id)
      }
    }
    if (item_ids.length === 0) {
      // all null, all done now
      this.setState({firstFiveUpdated: true})
    }
    else {
      //we have some ids, now lets request details from server
      axios.get('./itemDetails', {params: {ids: item_ids.toString()}})
        .then((res) => {
          let inventoryCopy = this.state.selectedCharacterInventory.slice()
          const itemDetails = res.data
          itemDetails.forEach((x) => {
            let i = id_indexer[x.item_id]
            inventoryCopy[i] = x
          })
          this.setState({selectedCharacterInventory: inventoryCopy, firstFiveUpdated: true})
        })
    }
  }


  rearrangeFirstFive() {
    //look at the first 5:
    const firstFive = this.state.selectedCharacterInventory.slice(0,5)
    let firstItem = null
    let firstItemIndex
    for(let i = 0; i < firstFive.length && !firstItem; i++) {
      firstItem = firstFive[i]
      firstItemIndex = i
    }

    //if there is at least one item,
    if (firstItem) {
      //  be swapped with another random spot
      let swapIndex = Math.floor(Math.random()*4)
      if (swapIndex >= firstItemIndex) {
        swapIndex++ //don't swap with self, and allow swap with index 5
      }
      let newItemOrder = [0,1,2,3,4]
      newItemOrder[firstItemIndex] = swapIndex
      newItemOrder[swapIndex] = firstItemIndex

      this.setState({newItemOrder, reorderType: 'swap'})
    }



    //else if all null
    else {
      //  request that any item be placed in slot 3
      this.setState({reorderType: 'allNull'})

    }
  }








  renderFirstFive() {
    // display each of the 5 items
    const inventory = this.state.selectedCharacterInventory
    return (
      <div>
        <Item item = {inventory[0]} />
        <Item item = {inventory[1]} />
        <Item item = {inventory[2]} />
        <Item item = {inventory[3]} />
        <Item item = {inventory[4]} />
      </div>
    )
  }


  renderReordered () {
    const inventory = this.state.selectedCharacterInventory
    const newItemOrder = this.state.newItemOrder

    if (this.state.reorderType === 'swap'){
      return (
        <div>
          <Item item = {inventory[newItemOrder[0]]} />
          <Item item = {inventory[newItemOrder[1]]} />
          <Item item = {inventory[newItemOrder[2]]} />
          <Item item = {inventory[newItemOrder[3]]} />
          <Item item = {inventory[newItemOrder[4]]} />
        </div>
      )
    }
    else {

      return (
        <div>
          <Item item = {inventory[0]} />
          <Item item = {inventory[1]} />
          <Item item = {'unknown'} />
          <Item item = {inventory[3]} />
          <Item item = {inventory[4]} />
        </div>
      )
    }
  }



  render() {
    return (
      <div>
        <div>{'The API shows these items as the first 5 slots in your inventory:'}</div>
        <div>{this.state.firstFiveUpdated ? this.renderFirstFive.bind(this)() : 'Waiting for API...'}</div>
          <br />
        <button onClick = {this.onRefreshInventoryClick.bind(this)}>{'Refresh inventory from API'}</button>
          <br />
          <br />
          <br />
        <div>{'To confirm that you are ready to start, rearrange those items to this order:'}</div>
        <div>{this.state.reorderType ? this.renderReordered.bind(this)() : 'Waiting for API...'}</div>
          <br />
        <button onClick = {this.onReorderClick.bind(this)}>Get different order</button>

      </div>
    )
  }
}
