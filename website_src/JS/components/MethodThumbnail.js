import PropTypes from 'prop-types'
import React from 'react'

import Item from './Item.js'
import Currency from './Currency.js'

const propTypes = {
  method: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  index: PropTypes.number,
  selected: PropTypes.bool,
}
export default class MethodThumbnail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      color: 'black'
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // REACT METHODS
  ////////////////////
  componentDidMount() {
    switch(this.props.method.method_type) {

      case 'Farming':
      this.setState({color: '#bf8f28'})
      break

      case 'Currency':
      this.setState({color: '#c48e68'})
      break

      default:
      this.setState({color: '#42b9dd'})
      break

    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // EVENT HANDLERS
  ///////////////////


  //////////////////////////////////////////////////////////////////////////////
  // HELPER METHODS
  ///////////////////


  //////////////////////////////////////////////////////////////////////////////
  // RENDER METHODS
  ///////////////////
  renderMethod() {// lol
    const method = this.props.method
    switch(method.method_type) {

      case 'Farming':
      return <img src="/Images/gw2data/farming.png"
          style={{height: '64px', width: '64px', float: 'left'}} />

      case 'Currency':
      return <Currency currency={method.key_element} />

      default:
      return <Item item={method.key_element} />

    }
    //method type
    //key item
    //key item name


  }
  /*
  Farming
  Currency
  Container
  Consumable
  Salvage:
  Mystic Forge: https://render.guildwars2.com/file/0A294B967DFAF499263F0EE76163566543EEC470/866143.png

  */


  render() {
    return (
      <div style={{backgroundColor: this.state.color, float: 'left', height: '64px', width: '256px',
                  boxShadow: (this.props.selected?'0 0 20px #0b6803':'none'), borderWidth: '3px',
                  margin: '5px'}}
        index={this.props.index} className="MethodThumbnail" onClick = {this.props.onClick}
      >
        {this.renderMethod()}
        <div style={{fontWeight: 'bold'}}>{this.props.method.method_type+':'}</div>
        <div>{this.props.method.key_element.name}</div>
      </div>
    )
  }
}

MethodThumbnail.propTypes = propTypes
