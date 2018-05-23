import PropTypes from 'prop-types'
import React from 'react'

const propTypes = {
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  default: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
}
export default class SalvageSelect extends React.Component {
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


  render() {
    return (
      <div>
        <div>{this.props.label}</div>
        <div><select defaultValue={this.props.default} onChange={this.props.onChange}
            name={this.props.name}
          >
          <option value="crude">Crude Salvage Kit</option>
          <option value="copperfed">Copper-Fed/Basic Salvage Kit</option>
          <option value="fine">Fine Salvage Kit</option>
          <option value="journeyman">{`Journeyman's Salvage Kit`}</option>
          <option value="silverfed">Silver-Fed/Master/Mystic Salvage Kit</option>
          <option value="blacklion">Black Lion Salvage Kit</option>
        </select></div>
      </div>
    )
  }
}

SalvageSelect.propTypes = propTypes
