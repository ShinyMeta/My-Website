import React from 'react'
import { Link, Route, Switch } from 'react-router-dom'
import axios from 'axios'


import _404page from './_404page.js'
import App_0Begin from './App_0Begin.js'
import App_1Prep from './App_1Prep.js'
import App_2Start from './App_2Start.js'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedCharacter: null

    }


    //functions to passdown
    this.setSelectedCharacter = this.setSelectedCharacter.bind(this)

  }

  setSelectedCharacter(character){
    this.setState({selectedCharacter: character})
  }


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
        <h2>Welcome, {this.props.user.username}! You are Signed in!</h2>
        <button type="button" onClick = {this.onClick.bind(this)}>Logout</button>
          <br />
          <br />
        <Switch>
          <Route exact path="/" component = {App_0Begin}/>
          <Route path="/1-prep" render = {(props) => {
              return <App_1Prep {...props} user = {this.props.user}
                selectedCharacter={this.state.selectedCharacter}
                setSelectedCharacter={this.setSelectedCharacter}
              />
            }} />
          <Route path="/2-start" render = {(props) => {
              return <App_2Start {...props} user = {this.props.user}
                selectedCharacter={this.state.selectedCharacter}
              />
            }} />
          <Route path="/3-running" />
          <Route path="/4-stopped" />
          <Route path="/5-viewresults" />
          <Route path="/6-finish" />
          <Route component={_404page} />
        </Switch>
      </div>
    )
  }
}
