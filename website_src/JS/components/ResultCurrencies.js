import PropTypes from 'prop-types'
import React from 'react'

import Currency from '../components/Currency.js'

const propTypes = {
  currencies: PropTypes.array.isRequired,
  onDoubleClick: PropTypes.func.isRequired
}
export default class ResultCurrencies extends React.Component {
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

  renderCurrencies() {
    //go through each currency, add difference attr, and render currency
    let currencyComponents = this.props.currencies.map((currency) => {
      return <Currency currency = {currency} key = {currency.currency_id}
        onDoubleClick={this.props.onDoubleClick}/>
    })
    return currencyComponents
  }



  render() {
    return (
      <div>
        <h4>Currencies</h4>
        {this.renderCurrencies()}

      </div>
    )
  }
}

ResultCurrencies.propTypes = propTypes
