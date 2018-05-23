import React from 'react';

import GW2API from '../../../server_routes/gw2tools/gw2API.js'

export default class App_1PrepSelect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      characters: null
    }

  }
  /////////////////
  //React methods
  ////////////////
  componentDidMount() {
    //get the character list from api
    GW2API.characters(this.props.user.apikey, false)
      .then((characters) => {
        this.setState({characters})
      })
      .catch((err) => {
        console.error(err)
      })
  }

  shouldComponentUpdate(nextProps, nextState) {
    //should only update to or populate select
    //(only when chars go from null to values)
    return (!this.state.characters && nextState.characters)
  }





  ////////////////
  //Custom helper functions
  ////////////////

  //takes in a string, then returns it with <option> tags for selecter
  addOption(character) {
    return <option key = {character} value = {character}>{character}</option>
  }
  //creates a string of options with charnames
  characterOptions() {
    if (this.state.characters)
      return this.state.characters.map(this.addOption)
    else
      return
  }

  render() {
    return (
      <select defaultValue={'default'} onChange={this.props.onChange}>
        <option value="default" key="0" disabled hidden>--Select a Character--</option>
        {this.characterOptions()}
      </select>
    )
  }
}
