import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
import { Route, Switch, Redirect, withRouter } from 'react-router-dom'


//components
import Loading from './Loading'

//pages
import Login from '../pages/Login.js'
import MakeRecord from '../pages/MakeRecord.js'
import Reports from '../pages/Reports.js'

const propTypes = {
  user: PropTypes.object,
  userFetchDone: PropTypes.bool.isRequired,
  setUser: PropTypes.func.isRequired,
  // history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
}
class PageContent extends React.Component {
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
    if (!this.props.userFetchDone) {
      return <Loading />
    }
    if (!this.props.user && this.props.location.pathname !== '/login') {
      return <Redirect to="/login" />
    }
    if (this.props.user && this.props.location.pathname === '/login') {
      return <Redirect to="/" />
    }

    //else
    return (
      <div>
        <Switch>
          <Route path="/makeRecord" render = {(props) => {
            return <MakeRecord {...props} user = {this.props.user} />
          }} />
          <Route path="/reports" component = {Reports}/>
          <Route path = "/login" render={() => {
            return <Login user = {this.props.user}
              setUser = {this.props.setUser}/>
            }}/>
          <Route path = "/" render={(props) => {
            return <h3>Click one of the links above to begin.</h3>
            }}/>
        </Switch>
      </div>
    )
  }
}

PageContent.propTypes = propTypes
export default withRouter(PageContent)
