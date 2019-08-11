import axios from 'axios'
import BootstrapTable from 'react-bootstrap-table-next';
import PropTypes from 'prop-types'
import React from 'react'

import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import FarmingMethodInputs from './FarmingMethodInputs.js'
import GW2API from '../../../server_routes/gw2tools/gw2API.js'
import Item from './Item.js'
import Timer from './Timer.js'
import Loading from './Loading.js'

const propTypes = {

}
export default class Report_GoldFarmDetails2 extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selected_map: null,
      selected_strategy: null,
      report_obj: {not_set: true},
      table_data: {not_set: true},
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
        //consolidate records into one array for Report
        this.buildTableData(report_obj)
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

  buildTableData(report_obj) {
    const table_data = {
      total_time: 0,
      // currency_rows: [],
      item_rows: [],
    }

    const seen = {
      items: {},
      // currencies: {}
    }

    //consolidate records into one array of items with qtys
    report_obj.records.forEach((record) => {
          //add to total time
          const duration = Date.parse(record.end_time) - Date.parse(record.start_time)
          table_data.total_time += duration

          //add items to item row data
          record.items.forEach((item) => {
            if (seen.items[item.item_id] || seen.items[item.item_id] === 0) {
              // just add qty to item Row
              table_data.item_rows[seen.items[item.item_id]].item.quantity += item.quantity
            }
            else {
              seen.items[item.item_id] = table_data.item_rows.length

              table_data.item_rows.push({item})
            }
          })

          //add currencies to currency row data
          // record.currencies.forEach((currency) => {
          //   if (table_data.currency_rows[currency.currency_id]) {
          //     // just add qty to currency Row
          //     table_data.currency_rows[currency.currency_id].quantity += currency.quantity
          //   }
          //   else {
          //     table_data.currency_rows[currency.currency_id] = currency
          //   }
          // })
    })
    this.setState({table_data: table_data})
  }















  isLoading() {
    return (!this.state.report_obj || !this.state.table_data)
  }

  isNotSet() {
    return (this.state.report_obj.not_set || this.state.table_data.not_set)
  }

  //////////////////////////////////////////////////////////////////////////////
  // RENDER METHODS
  ///////////////////

  DataTable() {
    if (this.isLoading()){
      return <Loading />
    }
    if (this.isNotSet()) {
      return null
    }

    const columns = [{
      dataField: 'item',
      text: 'Icon',
      formatter: (cell, row) => {return <Item item={cell} />}
    }, {
      dataField: 'item.name',
      text: 'Name'
    }, {
      dataField: 'item.item_id',
      text: 'Conversion Technique'
    }, {
      dataField: 'item.item_id',
      text: 'Gold per Unit'
    }, {
      dataField: 'item.item_id',
      text: 'Gold per Hour'
    }]
    const data = this.state.table_data.item_rows
    return <BootstrapTable keyField='item.item_id' data={data} columns={columns} />
  }


  render() {
    return (
      <div>
        <h4>Select a map and enter method name to request a report</h4>
        <FarmingMethodInputs onSelectChange={this.handleMapChange.bind(this)}
              onTextChange={this.handleStrategyChange.bind(this)}/>
        <button type="button" onClick={this.onLoadReportClick.bind(this)}>Load Report</button>
        <div>
          {this.DataTable()}
        </div>

      </div>
    )
  }
}

Report_GoldFarmDetails2.propTypes = propTypes
