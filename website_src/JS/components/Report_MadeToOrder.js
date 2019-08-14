import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'

import Item from './Item.js'
import Currency from './Currency.js'

const propTypes = {

}
export default class Report_MadeToOrder extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listOfMethodTypes: [],
      selectedMethodType: null,
      listOfKeyElements: [],
      selectedKeyElement: null,

      reportData: null,
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // REACT METHODS
  ////////////////////
  componentDidMount() {
    axios.get('/gw2data/report/madeToOrder/methodsByUser')
      .then((res) => {
        let listOfMethodTypes = res.data.map((x) => x.method_type)
        if (listOfMethodTypes.length === 0){
          alert ('No saved methods found for this user')
        }
        else {
          this.setState({listOfMethodTypes, selectedMethodType: listOfMethodTypes[0]})
        }
      })
      .catch((err) => {
        console.error(err)
        alert('error getting methods for this user')
      })
  }


  //////////////////////////////////////////////////////////////////////////////
  // EVENT HANDLERS
  ///////////////////

  onMethodSelectChange(e) {
    this.setState({
      selectedMethodType: e.target.value,
      listOfKeyElements: [],
      selectedKeyElement: null
    })
  }

  onGetKeyElementsButtonClick(e){
    axios.get('/gw2data/report/madeToOrder/keyElementsByMethod?method_type='+this.state.selectedMethodType)
      .then((res) => {
        const listOfKeyElements = res.data
        const selectedKeyElement = listOfKeyElements[0].currency_id || listOfKeyElements[0].item_id 
        this.setState({listOfKeyElements, selectedKeyElement})
      })
      .catch((err) => {
        console.error(err)
        alert('error getting key elements for this method')
      })
  }


  

  onKeyElementSelectChange(e) {
    this.setState({
      selectedKeyElement: e.target.value,
    })
  }

  onGetReportDataButtonClick(e){
    axios.get(`/gw2data/report/madeToOrder/SimpleReportData?method_type=${this.state.selectedMethodType}&key_element=${this.state.selectedKeyElement}`)
      .then((res) => {
        const reportData = res.data
        this.setState({reportData})
      })
      .catch((err) => {
        console.error(err)
        alert('error getting report data')
      })
  }


  //////////////////////////////////////////////////////////////////////////////
  // HELPER METHODS
  ///////////////////


  //////////////////////////////////////////////////////////////////////////////
  // RENDER METHODS
  ///////////////////
  
  //takes in a string, then returns it with <option> tags for selecter
  addMethodTypeOption(method_type) {
    return <option key = {method_type} value = {method_type}>{method_type}</option>
  }

  //creates a string of options with method type names
  methodTypesOptions() {
    if (this.state.listOfMethodTypes)
      return this.state.listOfMethodTypes.map(this.addMethodTypeOption)
    else
      return
  }
  
  //takes in a string, then returns it with <option> tags for selecter
  addKeyElementOption(key_element) {
    const element_id = key_element.item_id || key_element.currency_id
    return <option key = {element_id} value = {element_id}>{element_id+' '+key_element.name}</option>
  }

  //creates a string of options with key element names
  keyElementsOptions() {
    if (this.state.listOfKeyElements)
      return this.state.listOfKeyElements.map(this.addKeyElementOption)
    else
      return
  }


  //adds the key element to the first table
  reportKeyElementRow() {
    if (this.state.reportData)
      //lookup key element in report data
      return <tr>
        <td><Item item = {this.state.reportData.keyElementDetails.details} /></td>
        <td>{this.state.reportData.keyElementDetails.details.name}</td>
        <td>{Math.abs(this.state.reportData.keyElementDetails.quantity)}</td>
      </tr>
    else
      return
  }



  //returns the <tr>s for item table
  reportItemRow(item) {
    return <tr key={item.item_id}>
      <td><Item item = {item.details} /></td>
      <td>{item.details.name}</td>
      <td>{Math.abs(item.quantity)}</td>
    </tr>
  }

  reportItemRows() {
    if (this.state.reportData) {
      const items = this.state.reportData.items
      return items.map((x) => this.reportItemRow(x))
    }
  }


  //returns the <tr>s for an currency table
  reportCurrencyRow(currency) {
    return <tr key={currency.currency_id}>
      <td><Currency currency = {currency.details} /></td>
      <td>{currency.details.name}</td>
      <td>{Math.abs(currency.quantity)}</td>
    </tr>
  }

  reportCurrencyRows() {
    if (this.state.reportData) {
      const currencies = this.state.reportData.currencies
      return currencies.map((x) => this.reportCurrencyRow(x))
    }
  }





  render() {
    return (
      <div>
        <label htmlFor="methodSelect">method_type: </label>
        <select onChange={this.onMethodSelectChange.bind(this)} id="methodSelect">
          <option value="loading" key="-1" disabled>--Select a Method Type--</option>
          {this.methodTypesOptions()}
        </select>
        <button onClick = {this.onGetKeyElementsButtonClick.bind(this)}>Get Key Elements for this Method Type</button>

        <br />
        <br />

        <label htmlFor="keyElementSelect">key_element: </label>
        <select onChange={this.onKeyElementSelectChange.bind(this)} id="keyElementSelect">
          <option value="loading" key="-1" disabled>--Select a Key Element--</option>
          {this.keyElementsOptions()}
        </select>
        <button onClick = {this.onGetReportDataButtonClick.bind(this)}>Get Report Data for this Element and Method</button>

        <br />
        <br />

        <table>
          <thead>
            <tr>
              <th></th>
              <th>Key Element</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {this.reportKeyElementRow()}
          </tbody>
        </table>

        <table>
          <thead>
            <tr>
              <th></th>
              <th>Currency</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {this.reportCurrencyRows()}
          </tbody>
        </table>

        <table>
          <thead>
            <tr>
              <th></th>
              <th>Item</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {this.reportItemRows()}
          </tbody>
        </table>


      </div>
    )
  }
}

Report_MadeToOrder.propTypes = propTypes
