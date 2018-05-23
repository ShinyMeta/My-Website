import PropTypes from 'prop-types'
import React from 'react'

import SalvageSelect from './SalvageSelect.js'

const propTypes = {
  onChange: PropTypes.func.isRequired,
}
export default class SalvageSettingsInput extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  ////////////////////
  // REACT METHODS
  ///////////////////


  ////////////////////
  // EVENT HANDLERS
  ///////////////////




  ////////////////////
  // HELPER METHODS
  ///////////////////


  ////////////////////
  // RENDER METHODS
  ///////////////////


  render() {
    return (
      <div>
        <SalvageSelect name="green_salvage" label="Masterwork(greens) gear and low level rare gear:"
          onChange={this.props.onChange} default="copperfed"/>
        <SalvageSelect name="yellow_salvage" label="Rare(yellow) gear level 68 and greater:"
          onChange={this.props.onChange} default="silverfed"/>
        <div>
          <div>{`Magic Find (Leave BLANK if unaffected by magic find):`}</div>
          <input type="number" name="magic_find" onChange={this.props.onChange}></input>
        </div>
      </div>
    )
  }
}

SalvageSettingsInput.propTypes = propTypes
