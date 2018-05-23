import React from 'react'
import { Link, Route, Switch } from 'react-router-dom'
import axios from 'axios'


import _404page from './_404page.js'
import App_0Begin from './App_0Begin.js'
import App_1Prep from './App_1Prep.js'
import App_2Start from './App_2Start.js'
import App_3Running from './App_3Running.js'
import App_4Stopped from './App_4Stopped.js'
import App_5Editing from './App_5Editing.js'
import Loading from '../components/Loading.js'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedCharacter: null,
      currentStep: 'pending',
      start_time: 'pending',
      timeElapsed: 0,
      timerInterval: null,
      end_time: 0,
      differences: 'pending'
    }


    //functions to passdown
    this.setSelectedCharacter = this.setSelectedCharacter.bind(this)
    this.setStartTime = this.setStartTime.bind(this)
    this.setTimerInterval = this.setTimerInterval.bind(this)
    this.setTimeElapsed = this.setTimeElapsed.bind(this)
    this.setEndTime = this.setEndTime.bind(this)
    this.setDifferences = this.setDifferences.bind(this)

  }

  setSelectedCharacter(character){
    this.setState({selectedCharacter: character})
  }

  setStartTime(start_time){
    this.setState({start_time})
  }

  setTimerInterval(timerInterval){
    this.setState({timerInterval})
  }

  setTimeElapsed(timeElapsed){
    this.setState({timeElapsed})
  }

  setEndTime(end_time){
    this.setState({end_time})
  }

  setDifferences(differences){
    this.setState({differences})
  }




  ////////////////////
  // REACT METHODS
  ///////////////////

  componentDidMount() {
    //make request to server to get current data
    this.getCurrentStep()
  }





  ////////////////////
  // EVENT HANDLERS
  ///////////////////

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





  //////////////////////////////////////////////////////////////////////////////
  // HELPER METHODS
  ///////////////////


  getCurrentStep() {
    axios.get('/gw2data/currentStep')
      .then((res) => {
        const {currentStep, selectedCharacter, start_time, end_time, differences} = res.data
        switch(currentStep) {
          case 0:
            this.setState({currentStep},
              () => this.props.history.push('./'))
            break
          case 3:
            this.setState({currentStep, selectedCharacter, start_time: Date.parse(start_time)},
              () => this.props.history.push('./3-running'))
            break
          case 4:
            this.setState({currentStep, selectedCharacter,
                  start_time: Date.parse(start_time), end_time: Date.parse(end_time),
                  timeElapsed: Date.parse(end_time) - Date.parse(start_time)},
              () => this.props.history.push('./4-stopped'))
            break
          case 5:
            this.setState({currentStep, selectedCharacter,
                  start_time: Date.parse(start_time), end_time: Date.parse(end_time),
                  timeElapsed: Date.parse(end_time) - Date.parse(start_time),
                  differences},
              () => this.props.history.push('./5-editing'))
            break

        }
      })
  }




  render() {
    if (this.state.currentStep === 'pending'){
      return <Loading />
    }

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
                setStartTime = {this.setStartTime}
              />
            }} />
          <Route path="/3-running" render = {(props) => {
              return <App_3Running {...props} user = {this.props.user}
                start_time = {this.state.start_time}
                timeElapsed = {this.state.timeElapsed}
                timerInterval = {this.state.timerInterval}
                setTimerInterval = {this.setTimerInterval.bind(this)}
                setTimeElapsed = {this.setTimeElapsed.bind(this)}
                setEndTime = {this.setEndTime}
              />
            }} />
          <Route path="/4-stopped" render = {(props) => {
              return <App_4Stopped {...props} user = {this.props.user}
                selectedCharacter={this.state.selectedCharacter}
                setDifferences={this.setDifferences}
                timeElapsed = {this.state.timeElapsed}
              />
            }} />
          <Route path="/5-editing" render = {(props) => {
              return <App_5Editing {...props} user = {this.props.user}
                timeElapsed={this.state.timeElapsed}
                differences={this.state.differences}
              />
            }} />
          <Route path="/6-finish" />
          <Route component={_404page} />
        </Switch>
      </div>
    )
  }
}
