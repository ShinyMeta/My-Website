import PropTypes from 'prop-types'
import React from 'react'
import {Link, Route, Switch} from 'react-router-dom'


import Report_TopGoldFarm from '../components/Report_TopGoldFarm.js'
import Report_MadeToOrder from '../components/Report_MadeToOrder.js'
import Report_GoldFarmDetails2 from '../components/Report_GoldFarmDetails2.js'

const propTypes = {

}
export default class Reports extends React.Component {
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
        <h4>Select the type of report you want to run:</h4>
        <Link to="/reports/MadeToOrder">MadeToOrder Reports</Link>
        <br />
        <Link to="/reports/topGoldFarm">Top Gold Farming Methods</Link>
        <br />
        <Link to="/reports/GoldFarmDetails">Gold Farm Details</Link>
        <br />
        <br />

        <Switch>
          <Route path="/reports/MadeToOrder" component = {Report_MadeToOrder}/>
          <Route path="/reports/topGoldFarm" component = {Report_TopGoldFarm}/>
          <Route path="/reports/GoldFarmDetails" component = {Report_GoldFarmDetails2}/>
        </Switch>
      </div>
    )
  }
}

Reports.propTypes = propTypes
