import React from 'react'
import { Link, Redirect, Route } from 'react-router-dom'

import App from './App.js'

export default class Home extends React.Component {
  render() {

    //display app if logged in, passing route down
    if (this.props.user) {
      return (
        <Route path = "/" component = {() => {
          return <App user = {this.props.user} setUser = {this.props.setUser} />
        }} />
      )
    }

    //redirect to "Welcome" home page if not logged in
    else if (this.props.location.pathname !== '/') {
      return <Redirect to="/" />
    }
    else {
      return (<div>
        <h2>{'Welcome!'}</h2>
        <Link to="/login">Login</Link>
      </div>)
    }
  }


}
