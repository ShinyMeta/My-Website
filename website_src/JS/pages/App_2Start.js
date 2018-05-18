import React from 'react';

import GW2API from '../../../server_routes/gw2tools/gw2API.js'
import Item from '../components/Item.js'


export default class Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedCharacterInventory: null,
      firstFiveItems: null,
      rearragedItems: null,
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



  ////////////////////
  // HELPER METHODS
  ///////////////////

  getItemsFromAPI() {
    GW2API.characterInventory(this.props.user.apikey, this.props.selectedCharacter)
      .then((inventory) => {
        this.setState({selectedCharacterInventory: inventory})
        // this.getFirstFive(inventory)
      })
  }

  getFirstFive(inventory) {
    let item_ids = []
    for (let i = 0; i < 5; i++) {
      //skip null
      if (inventory[i]){
        item_ids.push(inventory[i].id)
      }
    }
    if (item_ids.length === 0) {
      // all null, can set
      return this.setState({firstFiveItems: inventory.slice(0,4)})
    }


  }


  renderFirstFive() {
    // display each of the 5 items
    return (
      <div>
        <Item item = {this.state.selectedCharacterInventory[0]} />
        <Item item = {this.state.selectedCharacterInventory[1]} />
        <Item item = {this.state.selectedCharacterInventory[2]} />
        <Item item = {this.state.selectedCharacterInventory[3]} />
        <Item item = {this.state.selectedCharacterInventory[4]} />
    </div>
    )
  }






  render() {
    return (
      <div>
        <span>{'The API shows these items as the first 5 slots in your inventory:'}</span>
        <div>{this.state.selectedCharacterInventory? this.renderFirstFive.bind(this)() : 'Waiting for API...'}</div>
          <br />
        <span>{'To confirm that you are ready to start, rearrange those items to this order:'}</span>
        <div>rearraged here</div>

      </div>
    )
  }
}
