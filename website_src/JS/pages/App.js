import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default class App extends React.Component {

  onClick(e) {
    //send logout to server to destroy session
    axios.post('/gw2data/logout')
    .then((res) => {
      //setUser on page to null
      this.props.setUser(null)
    })
    .catch((err) => {
      console.log('there was an error communicating with the server')
      console.error(err)
    })
  }


  render() {
    return (
      <div>
        <h2>{`Welcome, ${this.props.user.username}! You are Signed in!`}</h2>
        <button type="button" onClick = {this.onClick.bind(this)}>Logout</button>
      </div>
    )
  }
}
