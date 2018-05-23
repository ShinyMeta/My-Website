import React from 'react'
import { Link, Redirect, Route } from 'react-router-dom'

import App from './App.js'
import Loading from '../components/Loading.js'

export default class Home extends React.Component {
  render() {
    if (this.props.user === 'pending') {
      return <Loading />
    }
    //display app if logged in, passing route down
    else if (this.props.user) {
      return (
        <Route path = "/" render = {(props) => {
          return <App {...props} user = {this.props.user} setUser = {this.props.setUser} />
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
