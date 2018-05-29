import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'

import Loading from '../components/Loading.js'
import ResultCurrencies from '../components/ResultCurrencies.js'
import ResultItems from '../components/ResultItems.js'
import Timer from '../components/Timer.js'


const propTypes = {
  timeElapsed: PropTypes.number,
  differences: PropTypes.object,
  setEditedResults: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  setCurrentStep: PropTypes.func.isRequired,

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

  onConfirmClick(e) {
    //send back the differences object, but first check each id incase you shouldn't send it
    let editedResults = { items: [], currencies: [] }
    const differences = this.props.differences
    const removed = this.state.removed

    differences.items.forEach((item) => {
      if (!removed[item.item_id])
        editedResults.items.push(item)
    })
    differences.currencies.forEach((currency) => {
      if (!removed[currency.currency_id])
        editedResults.currencies.push(currency)
    })
    //now sending
    axios.post('/gw2data/editedResultsRecord', editedResults)
      .then(() => {
        this.props.setEditedResults(editedResults)
      })
      .catch((err) => {
        if (err.status === 403) {
          this.props.history.push('./error')
        }
        else {
          console.error(err)
        }
      })
    this.props.history.push('./6-finish')
    this.props.setCurrentStep(6)
  }


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
    if (this.props.differences === null) {
      return <Loading />
    }
    return (
      <div>
        <button type="button" onClick={this.onConfirmClick.bind(this)}>Confirm Changes</button>
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
