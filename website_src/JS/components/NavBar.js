import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
import { withRouter } from 'react-router-dom'


import Loading from './Loading.js'
import UpdateRef from './UpdateRef.js'

const propTypes = {
  user: PropTypes.object,
  userFetchDone: PropTypes.bool.isRequired,
  handleLogoutClick: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
}
class NavBar extends React.Component {
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
  onReportsClick() {
    if (this.props.location.pathname.substring(0,8) !== '/reports')
      this.props.history.push('/reports')
  }

  onBeginClick() {
    if (this.props.location.pathname.substring(0,11) !== '/makeRecord')
      this.props.history.push('/makeRecord/1-prep')
  }

  //////////////////////////////////////////////////////////////////////////////
  // HELPER METHODS
  ///////////////////


  //////////////////////////////////////////////////////////////////////////////
  // RENDER METHODS
  ///////////////////


  render() {
    //this thing just has links to reports and make record
    if (this.props.user) {
      return (
        <div>
          <button type="button" onClick={this.onBeginClick.bind(this)}>Make a Record</button>
          <button type="button" onClick={this.onReportsClick.bind(this)}>View Reports</button>

          <span>Welcome, {this.props.user.username}! You are Signed in!</span>
          <button type="button" onClick = {this.props.handleLogoutClick}>Logout</button>
          <UpdateRef user = {this.props.user}

          />
        </div>
      )
    }
    else {
      return null
    }
  }
}

NavBar.propTypes = propTypes

export default withRouter(NavBar)
