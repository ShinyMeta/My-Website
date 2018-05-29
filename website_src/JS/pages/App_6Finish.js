import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'

import FarmingMethodInputs from '../components/FarmingMethodInputs.js'
import Loading from '../components/Loading.js'
import MethodThumbnail from '../components/MethodThumbnail.js'

const propTypes = {
  editedResults: PropTypes.object,
  timeElapsed: PropTypes.number.isRequired,
  history: PropTypes.object.isRequired,
  setCurrentStep: PropTypes.func.isRequired,

}
export default class App_6Finish extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      possibleMethods: null,
      selectedMethodIndex: 0,
      strategy_nickname: '',
      map: '',
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // REACT METHODS
  ////////////////////
  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.possibleMethods || !nextProps.editedResults){
      return null
    }
    else {
       return App_6Finish.detectPossibleMethods(nextProps, prevState)
    }
  }



  //////////////////////////////////////////////////////////////////////////////
  // EVENT HANDLERS
  ///////////////////

  onSaveClick(e) {
    //compuse teh post object
    const finalState = {
      method: this.state.possibleMethods[this.state.selectedMethodIndex],
      map: this.state.map,
      strategy_nickname: this.state.strategy_nickname
    }

    axios.post('/gw2data/finalizeRecord', finalState)
    this.props.history.push('/')
    this.props.setCurrentStep(0)
  }

  handleTextChange(e) {
    this.setState({strategy_nickname: e.target.value})
  }

  handleSelectChange(e) {
    this.setState({map: e.target.value})
  }

  handleMethodClick(e) {
    let element = e.target
    while (element.className !== 'MethodThumbnail') {
      element = element.parentElement
    }
    this.setState({selectedMethodIndex: parseInt(element.attributes.index.value)})
  }


  //////////////////////////////////////////////////////////////////////////////
  // HELPER METHODS
  ///////////////////
  static detectPossibleMethods(nextProps) {
    //get list of negative currencies and items
    let negatives = {
      items: nextProps.editedResults.items.filter((item) => item.quantity < 0),
      currencies: nextProps.editedResults.currencies.filter((currency) => currency.quantity < 0)
    }


    //always goldFarm with duration
    let possibleMethods = [
      {
        method_type: 'Farming',
        key_element: { name: 'Gold/Hour', quantity: nextProps.timeElapsed }
      }
    ]
    //if negative currency
    if (negatives.currencies[0]) {
      negatives.currencies.forEach((currency) => {
        if (currency.name !== 'Coin'){
          possibleMethods.push({
            method_type: 'Currency',
            key_element: currency
          })
        }
      })
    }

    //if look at first negative item
    if(negatives.items[0]) {
      let firstItem = negatives.items[0]


      //if account/characterbound material
      if (firstItem.binding && firstItem.type === 'CraftingMaterial') {
        possibleMethods.push({
          method_type: 'Account Bound Material',
          key_element: firstItem
        })
      }
      //if container type
      if (firstItem.type === 'Container' && negatives.items.length === 1) {
        possibleMethods.push({
          method_type: 'Container',
          key_element: firstItem
        })
      }
      //if consumable type
      if (firstItem.type === 'Consumable' && negatives.items.length === 1) {
        possibleMethods.push({
          method_type: 'Consumable',
          key_element: firstItem
        })
      }
      //if salvage item
      if (firstItem.description === 'Salvage Item' && negatives.items.length === 1) {
        possibleMethods.push({
          method_type: 'Salvage',
          key_element: firstItem
        })
      }
      //if weapon/armor
        //salvage requires same rarity, level, subtype   and no 'NoSalvage' flag
        //flushing require same rarity, level, main type and no 'NoMysticForge' flag
      if (firstItem.type === 'Armor' || firstItem.type === 'Weapon'){
        const isPossible = checkArmorWeapon(firstItem, negatives.items)
        if (isPossible.salvage) {
          possibleMethods.push({
            method_type: 'Salvage',
            key_element: firstItem
          })
        }
        if (isPossible.flush) {
          possibleMethods.push({
            method_type: 'Mystic Forge',
            key_element: Object.assign({}, firstItem, {name: 'Forgable ' + firstItem.type,})
          })
        }
      }

      //look for clover and amalgamated gemstone in output
      const mysticClover = nextProps.editedResults.items.find(x => x.name === 'Mystic Clover')
      if (mysticClover) {
        possibleMethods.push({
          method_type: 'Mystic Forge',
          key_element: mysticClover
        })
      }
      const amalgGem = nextProps.editedResults.items.find(x => x.name === 'Amalgamated Gemstone')
      if (amalgGem) {
        possibleMethods.push({
          method_type: 'Mystic Forge',
          key_element: amalgGem
        })
      }

      //minis
      if (firstItem.type === 'MiniPet ') {
        //just make sure all of them are the same rarity
        possibleMethods.push({
          method_type: 'Mystic Forge',
          key_element: Object.assign({}, firstItem, {name: firstItem.rarity + ' Minis'})
        })
      }
    }

    return {possibleMethods}
  }





  //////////////////////////////////////////////////////////////////////////////
  // RENDER METHODS
  ///////////////////

  renderMethods() {
    return this.state.possibleMethods.map((method, index) => {
      return <MethodThumbnail method={method} key={index} index={index}
        selected={index === this.state.selectedMethodIndex}
        onClick={this.handleMethodClick.bind(this)}/>
    })
    //once that's done, state.possibleMethods should be set
    //need to display
  }


  render() {
    if (!this.state.possibleMethods) {
      return <Loading />
    }
    return (
      <div>
        <h4>Select the method used during the recording:</h4>
        <button type="button" onClick={this.onSaveClick.bind(this)}>Save Record</button>
        {this.state.possibleMethods[this.state.selectedMethodIndex].method_type === 'Farming'?
          <FarmingMethodInputs onSelectChange={this.handleSelectChange.bind(this)}
                          onTextChange={this.handleTextChange.bind(this)} />      : ''}
          <br />
        {this.renderMethods()}

      </div>
    )
  }
}

App_6Finish.propTypes = propTypes


function checkArmorWeapon(firstItem, items) {
  const firstDetails = JSON.parse(firstItem.details)

  return items.reduce((prev, item) => {

    const details = JSON.parse(item.details)

    const required_for_both = (
      item.rarity           === firstItem.rarity &&
      item.level            === firstItem.level
    )

    return {
      //check salvage
      salvage: prev.salvage && required_for_both &&
        details.type          === firstDetails.type &&
        details.weight_class  === firstDetails.weight_class &&
        !doesItemContainFlag(item, 'NoSalvage'),
      //check flush
      flush: prev.flush && required_for_both &&
        item.type             === firstItem.type &&
        !doesItemContainFlag(item, 'NoMysticForge')
    }
  }, {salvage:true, flush:true})
}

function doesItemContainFlag(item, flag) {
  const flags = JSON.parse(item.flags)
  if (flags)
    return flags.find(f => f === flag)
  else
  return false
}
