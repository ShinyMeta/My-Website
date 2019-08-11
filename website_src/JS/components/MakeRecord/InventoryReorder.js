import PropTypes from 'prop-types'
import React from 'react'

import Loading from '../Loading.js'
import Item from '../Item.js'


const propTypes = {
  selectedCharacter: PropTypes.string,
  selectedCharacterInventory: PropTypes.array,
  newItemOrder: PropTypes.array,
  swapVerified: PropTypes.bool,
  swapVerifiedMessage: PropTypes.string,
  handleStartClick: PropTypes.func.isRequired,
  handleRefreshInventoryClick: PropTypes.func.isRequired,
  handleReorderClick: PropTypes.func.isRequired,
  handleSwapCheckClick: PropTypes.func.isRequired,
}
export default class InventoryReorder extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // REACT METHODS
  ////////////////////


  //////////////////////////////////////////////////////////////////////////////
  // EVENT HANDLERS
  ///////////////////


  //////////////////////////////////////////////////////////////////////////////
  // HELPER METHODS
  ///////////////////


  //////////////////////////////////////////////////////////////////////////////
  // RENDER METHODS
  ///////////////////



    renderFirstFive() {
      // display each of the 5 items
      const inventory = this.props.selectedCharacterInventory
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
      const inventory = this.props.selectedCharacterInventory
      const newItemOrder = this.props.newItemOrder

      if (newItemOrder){
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
    if (!this.props.selectedCharacter){
      return null
    }

    return (
      <div>
        <div>{`The API shows these items as the first 5 slots in ${this.props.selectedCharacter}'s inventory:`}</div>
        <div>{this.props.selectedCharacterInventory ? this.renderFirstFive.bind(this)() : <Loading />}</div>
          <br />
        <button onClick = {this.props.handleRefreshInventoryClick}>{'Refresh inventory from API'}</button>
          <br />
          <br />
          <br />
        <div>{'To confirm that you are ready to start, rearrange those items to this order (put any item in place of \'?\'):'}</div>
        <div>{this.props.selectedCharacterInventory ? this.renderReordered.bind(this)() : <Loading />}</div>
          <br />
        <button onClick = {this.props.handleReorderClick}>Re-shuffle</button>
          <br />
          <br />
          <br />
        <div>
          <button onClick = {this.props.handleSwapCheckClick}>{'Check if API is updated to show swap'}</button>
            <br />
          <span>{this.props.swapVerifiedMessage}</span>
            <br />
          <button onClick={this.props.handleStartClick} disabled={!this.props.swapVerified} >{'START RECORDING'}</button>
        </div>{/*disabled={!this.props.swapVerified}*/}

      </div>
    )
  }
}

InventoryReorder.propTypes = propTypes
