import axios from 'axios'
import React from 'react';

import GW2API from '../../../server_routes/gw2tools/gw2API.js'
import Item from '../components/Item.js'
import Loading from '../components/Loading.js'


const default_state = {
  selectedCharacterInventory: null,
  firstFiveUpdated: false,
  newItemOrder: null,
  reorderType: null, //"allNull" or "swap"
  swapVerified: false,
  swapVerifiedMessage: '',
}

export default class Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedCharacterInventory: null,
      firstFiveUpdated: false,
      newItemOrder: null,
      reorderType: null, //"allNull" or "swap"
      swapVerified: false,
      swapVerifiedMessage: '',
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

  onStartClick(e) {
    Promise.all([
      GW2API.character(this.props.user.apikey, this.props.selectedCharacter),
      GW2API.fullAccountState(this.props.user.apikey)
    ])
      .then(([characterDetails, startingState]) => {
        startingState.character = {
          name: characterDetails.name,
          class: characterDetails.profession,
          level: characterDetails.level
        }
        return axios.post('./startRecord', startingState)
      })
      .catch((err) => {
        if (err.status === 403) {
          this.props.history.push('./error')
        }
        else {
          console.error(err)
        }
      })
    //
    this.props.setStartTime(Date.now())
    this.props.history.push('./3-running')
  }

  onRefreshInventoryClick(e) {
    // reset state, then
    this.setState(() => {
      return default_state
    })
    // get items from API again
    this.getItemsFromAPI()
  }

  onReorderClick(e) {
    this.rearrangeFirstFive()
  }

  onSwapCheckClick(e) {
    //get Items from API again
    GW2API.characterInventory(this.props.user.apikey, this.props.selectedCharacter)
      //check if first 5 match reorder strategy
      .then((new_inventory) => {
        //swap strategy
        if (this.state.newItemOrder) {
          //check if new inventory is old inventory mapped via new order
          const old_inventory = this.state.selectedCharacterInventory
          const newItemOrder = this.state.newItemOrder
          for (let i = 0; i < 5; i++) {
            if (!(!new_inventory[i]     && !old_inventory[newItemOrder[i]]) &&
                !((new_inventory[i]     &&  old_inventory[newItemOrder[i]]) &&
                  (new_inventory[i].id  === old_inventory[newItemOrder[i]].item_id) ) ) {
              this.setState({swapVerified: false, swapVerifiedMessage:
                  `The API does not yet reflect the indicated items in your inventory.
                  Double check your bag, or try again in a bit (can take up to 5 minutes to reflect changes)`})
              return
            }
          }
          //if we reached this, then all 5 items checked out
          this.setState({swapVerified: true, swapVerifiedMessage: 'VERIFIED'})
        }
      })
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








  ////////////////////
  // RENDER METHODS
  ///////////////////


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
        <div>{`The API shows these items as the first 5 slots in ${this.props.selectedCharacter}'s inventory:`}</div>
        <div>{this.state.firstFiveUpdated ? this.renderFirstFive.bind(this)() : <Loading />}</div>
          <br />
        <button onClick = {this.onRefreshInventoryClick.bind(this)}>{'Refresh inventory from API'}</button>
          <br />
          <br />
          <br />
        <div>{'To confirm that you are ready to start, rearrange those items to this order:'}</div>
      <div>{this.state.reorderType ? this.renderReordered.bind(this)() : <Loading />}</div>
          <br />
        <button onClick = {this.onReorderClick.bind(this)}>Re-shuffle</button>
          <br />
          <br />
          <br />
        <div>
          <button onClick = {this.onSwapCheckClick.bind(this)}>{'Check if API is updated to show swap'}</button>
            <br />
          <span>{this.state.swapVerifiedMessage}</span>
            <br />
          <button onClick={this.onStartClick.bind(this)}  >{'START RECORDING'}</button>
        </div>{/*disabled={!this.state.swapVerified}*/}

      </div>
    )
  }
}
