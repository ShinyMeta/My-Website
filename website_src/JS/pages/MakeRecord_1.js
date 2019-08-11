import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react';

import App_1PrepSelect from '../components/App_1PrepSelect.js'
import GW2API from '../../../server_routes/gw2tools/gw2API.js'
import gw2MyTools from '../../../server_routes/gw2tools/gw2MyTools.js'
import Item from '../components/Item.js'
import Loading from '../components/Loading.js'
import MakeRecord_Warning from '../components/MakeRecord/MakeRecord_Warning.js'
import InventoryReorder from '../components/MakeRecord/InventoryReorder.js'


const default_state = {
  characters: null,
  selectedCharacterInventory: null,
  // firstFiveUpdated: false,
  newItemOrder: null,
  // reorderType: null, //"allNull" or "swap"
  swapVerified: false,
  swapVerifiedMessage: '',
  inventory_beep_timer: -1,
}
const propTypes = {
  selectedCharacter: PropTypes.string,
  setSelectedCharacter: PropTypes.func.isRequired,
  user: PropTypes.object,
  setStartTime: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,

}
export default class MakeRecord_1 extends React.Component {
  constructor(props) {
    super(props)
    this.state = default_state
  }

    ////////////////////
    // REACT METHODS
    ///////////////////



  componentWillUnmount() {
    clearTimeout(this.state.inventory_beep_timer)
  }





  ////////////////////
  // EVENT HANDLERS
  ///////////////////
  handleSelectChange(e) {
    const character = e.target.value
    this.props.setSelectedCharacter(character)
    clearTimeout(this.state.inventory_beep_timer)
    this.getItemsFromAPI(character)
  }

  handleStartClick(e) {
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

  handleRefreshInventoryClick(e) {
    // reset state, then
    this.setState(() => {
      return default_state
    })
    // get items from API again
    clearTimeout(this.state.inventory_beep_timer)
    this.getItemsFromAPI()
  }

  handleReorderClick(e) {
    this.rearrangeFirstFive()
  }

  handleSwapCheckClick(e) {
    //get Items from API again
    this.checkSwap()
  }

  checkSwap() {
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


  resetTimer() {
    clearTimeout(inventory_beep_timer)
    let inventory_beep_timer = setTimeout(() => {
      gw2MyTools.beep()
      this.checkSwap()
      this.resetTimer()
    }, 305000) //305000 is 5 mins and 5 secs
    this.setState({inventory_beep_timer})
  }




  ////////////////////
  // HELPER METHODS
  ///////////////////

  getItemsFromAPI(character) {
    let selectedCharacter = this.props.selectedCharacter
    if (character) {
      selectedCharacter = character
    }

    const user = this.props.user

    GW2API.characterInventory(user.apikey, selectedCharacter)
      .then((inventory) => {
        this.resetTimer()
        return gw2MyTools.fillItemDetails(inventory)
      })
      .then((inventory) => {
        this.setState({selectedCharacterInventory: inventory})
        this.rearrangeFirstFive(inventory)
      })
  }


  rearrangeFirstFive(inventory) {
    //look at the first 5:
    const firstFive = inventory.slice(0,5)
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

      this.setState({newItemOrder})
    }

    //else if all null
    else {
      //  request that any item be placed in slot 3
      this.setState({newItemOrder: null})

    }
  }






  isLoading() {
    if (!this.props.user) {
      return true
    }
    else return false
  }

  ////////////////////
  // RENDER METHODS
  ///////////////////

  render() {
    if (this.isLoading()){
      return <Loading />
    }

    return (
      <div>
        <App_1PrepSelect onChange={this.handleSelectChange.bind(this)} user = {this.props.user}/>
          <br />
        <MakeRecord_Warning />

        <InventoryReorder
          selectedCharacter={this.props.selectedCharacter}
          selectedCharacterInventory={this.state.selectedCharacterInventory}
          newItemOrder={this.state.newItemOrder}
          swapVerified={this.state.swapVerified}
          swapVerifiedMessage={this.state.swapVerifiedMessage}
          handleStartClick={this.handleStartClick.bind(this)}
          handleRefreshInventoryClick={this.handleRefreshInventoryClick.bind(this)}
          handleReorderClick={this.handleReorderClick.bind(this)}
          handleSwapCheckClick={this.handleSwapCheckClick.bind(this)}
        />
      </div>





    )
  }
}
MakeRecord_1.propTypes = propTypes
