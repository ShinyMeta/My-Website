import PropTypes from 'prop-types'
import React from 'react'

const propTypes = {
  currency: PropTypes.object.isRequired,
  onDoubleClick: PropTypes.func,
}
export default class Currency extends React.Component {
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
  renderQuantity() {
    const currency = this.props.currency
    if (!currency.difference && currency.value > 1)
      return <div style={{position: 'absolute', top: '2px', right: '2px', color: 'white'}}
        title={currency.value}>
        {currency.value}
      </div>
    if (currency.difference >= 0)
      return <div style={{position: 'absolute', bottom: '2px', left: '2px', color: '#5dd55d'}}
        title={'+'+currency.difference}>
        +{currency.difference}
      </div>
    if (currency.difference < 0)
      return <div style={{position: 'absolute', bottom: '2px', right: '2px', color: '#e06c6c'}}
        title={currency.difference}>
        {currency.difference}
      </div>
  }

  renderCurrencyImage() {
    let tool_tip = this.props.currency.name
    if (this.props.currency.description) {
      tool_tip += '\n' + this.props.currency.description
    }
    return (
      <div style={{height: '64px', width: '64px', backgroundColor: 'black'}}>
        <img src={this.props.currency.icon} title={tool_tip}
          style={{height: '64px', width: '64px'}}
        />
        {this.renderQuantity()}
      </div>
    )
  }


  render() {
    return (
      <div className="Currency" currency_id={this.props.currency.currency_id}
        style={{float: 'left', width: '64px', height: '64px', position:'relative',
            textAlign:'center', fontWeight: 'bold', textShadow: '1px 1px black'}}
        onDoubleClick = {this.props.onDoubleClick}
      >
        {this.renderCurrencyImage()}
      </div>
    )
  }
}

Currency.propTypes = propTypes
