import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'

import GW2API from '../../../server_routes/gw2tools/gw2API.js'
import gw2MyTools from '../../../server_routes/gw2tools/gw2MyTools.js'
import Inventory from '../components/Inventory.js'
import SalvageSettingsInput from '../components/SalvageSettingsInput.js'
import Timer from '../components/Timer.js'



const propTypes = {
  user: PropTypes.object,
  selectedCharacter: PropTypes.string,
  setDifferences: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  timeElapsed: PropTypes.number.isRequired
}
export default class App_4Stopped extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedCharacterBags: null,
      green_salvage: 'copperfed',
      yellow_salvage: 'silverfed',
      magic_find: null,

    }
  }

  ////////////////////
  // REACT METHODS
  ///////////////////
  componentDidMount() {
    //fetch the bags to display
    this.getInventory()
    this.setState({selectedCharacterBags: null})
  }


  ////////////////////
  // EVENT HANDLERS
  ///////////////////

  onRefreshClick(e) {
    //just do the get inventory
    this.getInventory()
  }

  onResultsClick(e) {
    // get full account status,
    // package it up with green, yellow salvage, and magic_find
    GW2API.fullAccountState(this.props.user.apikey)
      .then((resultRecord) => {
        Object.assign(resultRecord, {
          green_salvage: this.state.green_salvage,
          yellow_salvage: this.state.yellow_salvage,
          magic_find: (this.state.magic_find ? this.state.magic_find : null),
        })

        axios.post('/gw2data/endItemsRecord', resultRecord)
          .then((res) => {
            //res.data has the currency and item differences between the states, need to set that in state of app
            this.props.setDifferences(res.data)
            this.props.history.push('./5-editing')
          })
      })

  }

  handleChange(e) {
    const value = e.target.value
    const name = e.target.name
    const state = {}
    state[name] = value
    this.setState(state)
  }


  ////////////////////
  // HELPER METHODS
  ///////////////////
  getInventory() {
    GW2API.characterBags(this.props.user.apikey, this.props.selectedCharacter)
      .then((bags) => {
        //need to get the details of each item, and merge them
        return gw2MyTools.fillBagsWithItemDetails(bags)
      })
      .then((bagsWithDetails) => {
        this.setState({selectedCharacterBags: bagsWithDetails})
      })
  }




  ////////////////////
  // RENDER METHODS
  ///////////////////


  render() {
    return (
      <div>
        <Timer timeElapsed = {this.props.timeElapsed}
          isStopped = {true}
         />
        <div>Time stopped, you can finish salvaging gear according to your selected strategy, and sell junk to vendors.</div>
          <br />
        <SalvageSettingsInput onChange={this.handleChange.bind(this)}/>
          <br />
        <div>{`Here is the API's copy of ${this.props.selectedCharacter}'s inventory. If it is not up to date, wait a bit and refresh.`}</div>
        <div>{`When the inventory below is accurate, click 'See Results'`}</div>
        <button onClick={this.onRefreshClick.bind(this)}>Refresh</button>
        <button onClick={this.onResultsClick.bind(this)}>See Results</button>
        <Inventory
          bags={this.state.selectedCharacterBags}
        />

      </div>
    )
  }
}

App_4Stopped.propTypes = propTypes
