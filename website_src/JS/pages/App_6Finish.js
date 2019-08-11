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
  resetApp: PropTypes.func.isRequired,

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
      .catch((err) => {
        if (err.status === 403) {
          this.props.history.push('/error')
        }
        else {
          console.error(err)
        }
      })
    this.props.history.push('/')
    this.props.resetApp()
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
      if (firstItem.description && firstItem.description.includes('Salvage Item')  && negatives.items.length === 1) {
        possibleMethods.push({
          method_type: 'Salvage',
          key_element: firstItem
        })
      }
      //if unidentified gear, also add salvage
      if (firstItem.name.includes('Unidentified Gear')  && negatives.items.length === 1) {
        possibleMethods.push({
          method_type: 'Salvage',
          key_element: firstItem
        })
      }

      //if weapon/armor
        //salvage requires same rarity, level, subtype, rune/sigils element   and no 'NoSalvage' flag
        //flushing require same rarity, level, main type and no 'NoMysticForge' flag
      if (firstItem.type === 'Armor' || firstItem.type === 'Weapon'){
        const isPossible = checkArmorWeapon(firstItem, negatives.items)

        //General Equipment Salvage
        if (isPossible.general_salvage) {
          //key element will need to have some slightly differen props,
          // going to seperate from firstitem
          let key_element = Object.assign({}, firstItem)
          key_element.details = JSON.parse(key_element.details)
          let upgrade1_rarity = null, upgrade1_element = null,
              upgrade2_rarity = null, upgrade2_element = null


          // if (key_element.type === 'Weapon' || key_element.type === 'Armor') {  //wait, don't we already know this?
          // giving the key element a slightly different name for the display card
          let armorweightstr = (key_element.details.weight_class)?key_element.details.weight_class+' ':''
          key_element.name = armorweightstr+key_element.details.type+'(s)'

          //getting any upgrades and adding them to the name and method deets
          if (key_element.upgrades) {
            let runesAndSigils = getUpgradeTypesFromItem(key_element)
            upgrade1_rarity = runesAndSigils[0].rarity
            upgrade1_element = runesAndSigils[0].element
            key_element.name += '\n with '+runesAndSigils[0].rarity+
                  ' Upgrade, Element: '+runesAndSigils[0].element
            if (runesAndSigils[1]) {
              upgrade2_rarity = runesAndSigils[1].rarity
              upgrade2_element = runesAndSigils[1].element
              key_element.name += '\n and '+runesAndSigils[1].rarity+
                    ' Upgrade, Element: '+runesAndSigils[1].element
            }
          }
          // }
          possibleMethods.push({
            method_type: 'General Equip Salvage',
            key_element,
            upgrade1_rarity,
            upgrade1_element,
            upgrade2_rarity,
            upgrade2_element
          })
        }
        if (isPossible.flush) {
          possibleMethods.push({
            method_type: 'Mystic Forge',
            key_element: Object.assign({}, firstItem, {name: 'Forgable ' + firstItem.type,})
          })
        }
        if (isPossible.specific_salvage) {
          possibleMethods.push({
            method_type: 'Salvage',
            key_element: firstItem
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
      if (firstItem.type === 'MiniPet') {
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
          (<div>Enter the nick-name or a brief description of your method (e.g. RIBA, map event rewards, leather farm, champ bags)
          <FarmingMethodInputs onSelectChange={this.handleSelectChange.bind(this)}
                          onTextChange={this.handleTextChange.bind(this)} /></div>)      : ''}
          <br />
        {this.renderMethods()}

      </div>
    )
  }
}

App_6Finish.propTypes = propTypes


function checkArmorWeapon(firstItem, items) {
  const firstDetails = JSON.parse(firstItem.details)
  let firstUpgradeTypes = getUpgradeTypesFromItem(firstItem)


  return items.reduce((prev, item) => {

    const details = JSON.parse(item.details)

    const conditionsForBoth = (
      item.rarity           === firstItem.rarity &&
      item.level            === firstItem.level
    )
    let conditionsForSalvage = (
      details.type          === firstDetails.type &&
      details.weight_class  === firstDetails.weight_class &&
      compareUpgrades(firstUpgradeTypes, getUpgradeTypesFromItem(item)) &&
      !doesItemContainFlag(item, 'NoSalvage')
    )
    let conditionsForFlush = (
      item.type             === firstItem.type &&
      !doesItemContainFlag(item, 'NoMysticForge')
    )
    let conditionsForSpecific = (
      items.length === 1 &&
      itemUpgradesMatchDefault(firstItem)
    )

    return {
      //check salvage
      general_salvage: prev.general_salvage && conditionsForBoth && conditionsForSalvage,
      //check flush
      flush: prev.flush && conditionsForBoth && conditionsForFlush,
      specific_salvage: prev.specific_salvage && conditionsForSpecific && conditionsForSalvage
    }
  }, {general_salvage:true, flush:true, specific_salvage:true})
}

//returns true if the upgrade ids match the api's default upgrade
function itemUpgradesMatchDefault(item) {

  //for now, just assuming that items never have 2 upgrades
  if (item.upgrades.length > 1) {return false}

  return axios.get('/gw2data/itemDetails?ids=' + item.item_id)
    .then((res) => res.data[0])
    .then((refitem) => {
      refitem.details = JSON.parse(refitem.details)

      //if default is no upgrades
      if (!refitem.details.suffix_item_id) {
        if (item.upgrades[0]) {return false}
        else {return true}
      }

      //if default is one upgrade
      else {
        if (!item.upgrades[0]) {return false}
        if (item.upgrades[0].item_id === refitem.details.suffix_item_id) {return true}
      }
    })
}

//returns true if both upg arrays contain the same type and element of rune/sigil
function compareUpgrades(upg1,upg2) {
  if (!upg1 && !upg2) return true
  if (upg1.length !== upg2.length) return false
  if (upg1.length === 1) {
    return (upg1[0].rarity === upg2[0].rarity && upg1[0].element === upg2[0].element)
  }
  else if (upg1.length === 2) {
    let comps = {
      '00': (upg1[0].rarity === upg2[0].rarity && upg1[0].element === upg2[0].element),
      '01': (upg1[0].rarity === upg2[1].rarity && upg1[0].element === upg2[1].element),
      '10': (upg1[1].rarity === upg2[0].rarity && upg1[1].element === upg2[0].element),
      '11': (upg1[1].rarity === upg2[1].rarity && upg1[1].element === upg2[1].element)
    }
    return (comps['00'] && comps['11']) || (comps['01'] && comps['10'])
  }
  else throw new Error('what the fuck, THREE UPGRADES???')
}

//function returns an array of runes/sigils' rarity and element
function getUpgradeTypesFromItem(item){
  if(item.upgrades) {
    let runesAndSigils = []
    item.upgrades.forEach((upgrade) => {
      //check if it is a rune or sigil
      if (typeof upgrade.details === 'string'){
        upgrade.details = JSON.parse(upgrade.details)
      }
      if (upgrade.details.type === 'Rune' || upgrade.details.type === 'Sigil') {
        runesAndSigils.push({
          //get rarity
          rarity: upgrade.rarity,
          //get element
          element: getElementFromUpgrade(upgrade)
        })

      }
    })
    return runesAndSigils
  }
  else return null
}
//this function is for extracting the rune/sigil "Element"
function getElementFromUpgrade(upgrade) {
  //cut out the html tags
  let str = upgrade.description.replace(/<.+?>/g, ' ')
  //get jsut the element string
  str = str.match(/Element:\s+\w+/)[0]
  //now replace element
  str = str.replace(/Element:\s+/, '')
  return str
}

function doesItemContainFlag(item, flag) {
  const flags = JSON.parse(item.flags)
  if (flags)
    return flags.find(f => f === flag)
  else
  return false
}
