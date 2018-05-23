import PropTypes from 'prop-types'
import React from 'react'

import Loading from '../components/Loading.js'
import ResultCurrencies from '../components/ResultCurrencies.js'
import ResultItems from '../components/ResultItems.js'
import Timer from '../components/Timer.js'


const propTypes = {
  timeElapsed: PropTypes.number,
  differences: PropTypes.object,

}
export default class App_5Editing extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      removed: { items: {}, currencies: {} },
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // REACT METHODS
  ////////////////////


  //////////////////////////////////////////////////////////////////////////////
  // EVENT HANDLERS
  ///////////////////

  handleDoubleClick(e) {
    //first, get the parent item div
    let element = e.target
    while (element.className !== 'Item' && element.className !== 'Currency') {
      element = element.parentElement
    }
    //now, ask if they want to remove
    if (confirm('Remove this from results?')) {
      element.style.opacity = .30
      const newRemoved = Object.assign(this.state.removed)

      if (element.className === 'Item') {
        newRemoved.items[element.attributes.item_id.value] = true
      }
      else if (element.className === 'Currency') {
        newRemoved.currencies[element.attributes.currency_id.value] = true
      }

      this.setState({removed: newRemoved})
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // HELPER METHODS
  ///////////////////


  //////////////////////////////////////////////////////////////////////////////
  // RENDER METHODS
  ///////////////////


  render() {
    if (this.props.differences === 'pending') {
      return <Loading />
    }
    return (
      <div>
        <Timer
          timeElapsed = {this.props.timeElapsed}
          isStopped = {true}
        />
        <ResultCurrencies
          onDoubleClick = {this.handleDoubleClick.bind(this)}
          currencies = {this.props.differences.currencies}
        />
        <br/>
        <ResultItems
          onDoubleClick = {this.handleDoubleClick.bind(this)}
          items = {this.props.differences.items}
        />
      </div>
    )
  }
}

App_5Editing.propTypes = propTypes
