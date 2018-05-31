import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'

import FarmingMethodInputs from './FarmingMethodInputs.js'
import GW2API from '../../../server_routes/gw2tools/gw2API.js'
import Item from './Item.js'
import Timer from './Timer.js'
import Loading from './Loading.js'

const propTypes = {

}
export default class Report_GoldFarmDetails extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selected_map: null,
      selected_strategy: null,
      report_obj: {not_set: true},
      combined_records: {not_set: true},
      TP_buy_or_sell: 'sell',
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // REACT METHODS
  ////////////////////


  //////////////////////////////////////////////////////////////////////////////
  // EVENT HANDLERS
  ///////////////////
  onLoadReportClick(e) {
    //get the data from server for selected map and strategy
    this.setState({report_obj: null})
    const params = {
      map: this.state.selected_map,
      strategy_nickname: this.state.selected_strategy
    }

    axios.get('/gw2data/report', {params})
      .then((res) => {
        const report_obj = res.data
        //consolidate records into one array of items with qtys
        this.consolodateRecordsToReport(report_obj)

        //request TP data for indexer TP ids
        return this.updateLocalTPPrices(report_obj)
          .then(() => {
            //pass through the indexer items and set a default "choice" based on best value
            for (let item_id in report_obj.indexer.items)
            { if (report_obj.indexer.items.hasOwnProperty(item_id)){
              this.setBestChoice(report_obj.indexer.items[item_id])
            } }
            return report_obj
          })
      })
      .then((report_obj) => {
        this.setState({report_obj})
      })
  }

  handleMapChange(e) {
    const selected_map= e.target.value
    this.setState({selected_map})
  }

  handleStrategyChange(e) {
    const selected_strategy= e.target.value
    this.setState({selected_strategy})
  }












  //////////////////////////////////////////////////////////////////////////////
  // HELPER METHODS
  ///////////////////

  setBestChoice(item) {
    let best_choice = {
      name: 'None',
      value: 0
    }
    item.choices.forEach((name) => {
      const value = this.getChoiceValue(item, name)
      if (value > best_choice.value) {
        best_choice.name = name
        best_choice.value = value
      }
    })

    item.selected_choice = best_choice
  }

  getChoiceValue(item, choice) {
      switch(choice){
        case 'Sell to NPC Vendor':
          return item.vendor_value
        case 'Trading Post':
          return item[this.state.TP_buy_or_sell]
        case 'None':
          return 0
        default:
          //this shouldn't happen
        break
      }
  }



  updateLocalTPPrices(report_obj) {
    //request TP data for indexer TP ids
    const indexer = report_obj.indexer
    return GW2API.tradingPost(indexer.TP_item_ids)
      .then((TP_array) => {
        TP_array.forEach((item_listing) => {
          indexer.items[item_listing.id].buy = item_listing.buys.unit_price
          indexer.items[item_listing.id].sell = item_listing.sells.unit_price
        })
        // this.setState({report_obj})
      })
  }

  consolodateRecordsToReport(report_obj) {
    const combined_records = {
      total_time: 0,
      currency_rows: {},
      item_rows: {},
    }

    //consolidate records into one array of items with qtys
    report_obj.records.forEach((record) => {
      //add time to hours
      const duration = Date.parse(record.end_time) - Date.parse(record.start_time)
      combined_records.total_time += duration

      //add items to item row data
      record.items.forEach((item) => {
        if (combined_records.item_rows[item.item_id]) {
          // just add qty to item Row
          combined_records.item_rows[item.item_id].quantity += item.quantity
        }
        else {
          combined_records.item_rows[item.item_id] = item
        }
      })

      //add currencies to currency row data
      record.currencies.forEach((currency) => {
        if (combined_records.currency_rows[currency.currency_id]) {
          // just add qty to currency Row
          combined_records.currency_rows[currency.currency_id].quantity += currency.quantity
        }
        else {
          combined_records.currency_rows[currency.currency_id] = currency
        }
      })
    })
    this.setState({combined_records})
  }



















  //////////////////////////////////////////////////////////////////////////////
  // RENDER METHODS
  ///////////////////

  renderReportData() {
    const report_obj = this.state.report_obj

    //if report not ready to display
    if (report_obj === null) {
      return <Loading/>
    }
    if (report_obj.not_set){
      return ''
    }



    const combined_records = this.state.combined_records

    const time = combined_records.total_time
    let total_row = {}
    let total_gph = 0
    // const currency_rows = []
    const item_rows = []

    // BUILD ITEM ROWS
    for (let item_id in combined_records.item_rows)
    { if (combined_records.item_rows.hasOwnProperty(item_id)) {
      //now we can make the row
      const item = Object.assign({}, combined_records.item_rows[item_id],
            report_obj.indexer.items[item_id])
      const gold_per_hour = item.selected_choice.value*item.quantity/(time/3600000)
      total_gph += gold_per_hour.toFixed(0)
      item_rows.push(<tr key={item_id}>
        <td><Item item={item}/></td>
        <td>{item.name}</td>
        <td>{item.selected_choice.name}</td>
        <td>{item.selected_choice.value}</td>
        <td>{gold_per_hour.toFixed(0)}</td>
      </tr>)
    } }

    //TOTAL ROW
    total_row = (<tr>
      <td></td>
      <td>TOTAL</td>
      <td></td>
      <td></td>
      <td>{(total_gph./10000)}</td>
    </tr>)



    //RETURN TABLE
    return (
      <div>
        <div>Total hours recorded: <Timer timeElapsed={time} isStopped={true} /></div>
        <table>
          <thead>
            <th>Icon</th>
            <th>Name</th>
            <th>Gold Conversion Used</th>
            <th>Gold per Unit</th>
            <th>Gold per Hour</th>
          </thead>
          <tbody>
            {total_row}
            {/* {currency_rows} */}
            {item_rows}
          </tbody>
        </table>
      </div>
    )
  }


  render() {
    return (
      <div>
        <h4>Select a map and enter method name to request a report</h4>
        <FarmingMethodInputs onSelectChange={this.handleMapChange.bind(this)}
              onTextChange={this.handleStrategyChange.bind(this)}/>
        <button type="button" onClick={this.onLoadReportClick.bind(this)}>Load Report</button>
        <div>
          {this.renderReportData()}
        </div>

      </div>
    )
  }
}

Report_GoldFarmDetails.propTypes = propTypes
