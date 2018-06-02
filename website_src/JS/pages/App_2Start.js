import axios from 'axios'
import React from 'react';

import GW2API from '../../../server_routes/gw2tools/gw2API.js'
import gw2MyTools from '../../../server_routes/gw2tools/gw2MyTools.js'
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

export default class App_2Start extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedCharacterInventory: null,
      firstFiveUpdated: false,
      newItemOrder: null,
      reorderType: null, //"allNull" or "swap"
      swapVerified: false,
      swapVerifiedMessage: '',
      timer_id: -1,
    }
  }

    ////////////////////
    // REACT METHODS
    ///////////////////

  componentDidMount() {
    //query API for selected chars items
    this.getItemsFromAPI()
  }

  componentWillUnmount() {
    clearTimeout(this.state.timer_id)
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
        return axios.post('/gw2data/startRecord', startingState)
      })
      .catch((err) => {
        if (err.status === 403) {
          this.props.history.push('/error')
        }
        else {
          console.error(err)
        }
      })
    //
    this.props.setStartTime(Date.now())
    this.props.history.push('/makeRecord/3-running')
    this.props.setCurrentStep(3)
  }

  onRefreshInventoryClick(e) {
    // reset state, then
    this.setState(() => {
      return default_state
    })
    // get items from API again
    clearTimeout(this.state.timer_id)
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
        else {
          //put any item into slot 3
          if (new_inventory[2]) {
            this.setState({swapVerified: true, swapVerifiedMessage: 'VERIFIED'})
          }
          else {
            this.setState({swapVerified: false, swapVerifiedMessage:
                `The API does not yet reflect the indicated items in your inventory.
                Double check your bag, or try again in a bit (can take up to 5 minutes to reflect changes)`})
            return
          }
        }
      })
  }









  ////////////////////
  // HELPER METHODS
  ///////////////////

  getItemsFromAPI() {
    GW2API.characterInventory(this.props.user.apikey, this.props.selectedCharacter)
      .then((inventory) => {
        let timer_id = setTimeout(() => {
          gw2MyTools.beep()
          this.getItemsFromAPI()
        }, 305000)
        this.setState(() => {return {selectedCharacterInventory: inventory, timer_id}},
        () => {
          this.getFirstFiveDetails()
          this.rearrangeFirstFive()
        })
      })
  }

  //this gets the details of the items from the server, overwriting the
  getFirstFiveDetails() {
    gw2MyTools.fillItemDetails(this.state.selectedCharacterInventory)
      .then((inventoryWithDetails) => {
        this.setState({selectedCharacterInventory: inventoryWithDetails, firstFiveUpdated: true})
      })
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
    if (!this.state.firstFiveUpdated){
      return <Loading />
    }

    return (
      <div>
        <div>{`The API shows these items as the first 5 slots in ${this.props.selectedCharacter}'s inventory:`}</div>
        <div>{this.state.firstFiveUpdated ? this.renderFirstFive.bind(this)() : <Loading />}</div>
          <br />
        <button onClick = {this.onRefreshInventoryClick.bind(this)}>{'Refresh inventory from API'}</button>
          <br />
          <br />
          <br />
        <div>{'To confirm that you are ready to start, rearrange those items to this order (put any item in place of \'?\'):'}</div>
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
