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
import App_6Finish from './App_6Finish.js'
import Loading from '../components/Loading.js'
import Reports from './Reports.js'

const default_state = {
  selectedCharacter: null,
  currentStep: null,
  start_time: 'pending',
  timeElapsed: 0,
  timerInterval: null,
  end_time: 0,
  differences: null,
  editedResults: null
}

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = default_state


    //functions to passdown
    this.setSelectedCharacter = this.setSelectedCharacter.bind(this)
    this.setCurrentStep = this.setCurrentStep.bind(this)
    this.setStartTime = this.setStartTime.bind(this)
    this.setTimerInterval = this.setTimerInterval.bind(this)
    this.setTimeElapsed = this.setTimeElapsed.bind(this)
    this.setEndTime = this.setEndTime.bind(this)
    this.setDifferences = this.setDifferences.bind(this)
    this.setEditedResults = this.setEditedResults.bind(this)
    this.resetApp = this.resetApp.bind(this)

  }

  setSelectedCharacter(character){
    this.setState({selectedCharacter: character})
  }

  setCurrentStep(currentStep){
    this.setState({currentStep})
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

  setEditedResults(editedResults){
    this.setState({editedResults})
  }


  resetApp(){
    this.setState(default_state)
    this.getCurrentStep
  }



  ////////////////////
  // REACT METHODS
  ///////////////////

  componentDidMount() {
    //make request to server to get current data
    const path_prefix = this.props.location.pathname.substring(0, 11)
    console.log(path_prefix)
    if (path_prefix === '/makeRecord')
      this.getCurrentStep()
    else
      this.setState({currentStep: 0})
  }





  ////////////////////
  // EVENT HANDLERS
  ///////////////////


  onLogoutClick(e) {
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


  onCancelClick(e) {
    if (confirm('Are you sure you want to cancel this recording? (You wil not be able to finish, and all data gathered will be lost)')){
      //send request to calncel recording
      this.setState({currentStep: 0})
      this.props.history.push('/')
      axios.post('/gw2data/cancelRecord')
        .then((res) => {

        })
        .catch((err) => {
          console.log('there was an error communicating with the server')
          console.error(err)
        })
    }
  }





  //////////////////////////////////////////////////////////////////////////////
  // HELPER METHODS
  ///////////////////


  getCurrentStep() {
    axios.get('/gw2data/currentStep')
      .then((res) => {
        const {currentStep, selectedCharacter, start_time, end_time, differences, editedResults} = res.data
        switch(currentStep) {
          case 0:
            this.setState({currentStep})
            if (this.props.location.pathname !== '/')
            this.props.history.push('/makeRecord/1-prep')
            break
          case 3:
            this.setState({currentStep, selectedCharacter, start_time: Date.parse(start_time)},
              () => this.props.history.push('/makeRecord/3-running'))
            break
          case 4:
            this.setState({currentStep, selectedCharacter,
                  start_time: Date.parse(start_time), end_time: Date.parse(end_time),
                  timeElapsed: Date.parse(end_time) - Date.parse(start_time)},
              () => this.props.history.push('/makeRecord/4-stopped'))
            break
          case 5:
            this.setState({currentStep, selectedCharacter,
                  start_time: Date.parse(start_time), end_time: Date.parse(end_time),
                  timeElapsed: Date.parse(end_time) - Date.parse(start_time),
                  differences},
              () => this.props.history.push('/makeRecord/5-editing'))
            break
          case 6:
            this.setState({currentStep, selectedCharacter,
                  start_time: Date.parse(start_time), end_time: Date.parse(end_time),
                  timeElapsed: Date.parse(end_time) - Date.parse(start_time),
                  editedResults},
              () => this.props.history.push('/makeRecord/6-finish'))
            break

        }
      })
  }




  render() {
    if (this.state.currentStep === null){
      return <Loading />
    }

    return (
      <div>
        <h2>Welcome, {this.props.user.username}! You are Signed in!</h2>
        <button type="button" onClick = {this.onLogoutClick.bind(this)}>Logout</button>
          <br />
        <button type="button" onClick = {this.onCancelClick.bind(this)}
          hidden={this.state.currentStep === 0}>Cancel Current Recording</button>
          <br />
        <Switch>
          <Route exact path="/" component = {App_0Begin}/>
          <Route path="/makeRecord/1-prep" render = {(props) => {
              return <App_1Prep {...props} user = {this.props.user}
                selectedCharacter={this.state.selectedCharacter}
                setSelectedCharacter={this.setSelectedCharacter}
              />
            }} />
          <Route path="/makeRecord/2-start" render = {(props) => {
              return <App_2Start {...props} user = {this.props.user}
                selectedCharacter={this.state.selectedCharacter}
                setStartTime = {this.setStartTime}
                setCurrentStep = {this.setCurrentStep}
              />
            }} />
          <Route path="/makeRecord/3-running" render = {(props) => {
              return <App_3Running {...props} user = {this.props.user}
                start_time = {this.state.start_time}
                timeElapsed = {this.state.timeElapsed}
                timerInterval = {this.state.timerInterval}
                setTimerInterval = {this.setTimerInterval.bind(this)}
                setTimeElapsed = {this.setTimeElapsed.bind(this)}
                setEndTime = {this.setEndTime}
                setCurrentStep = {this.setCurrentStep}
              />
            }} />
          <Route path="/makeRecord/4-stopped" render = {(props) => {
              return <App_4Stopped {...props} user = {this.props.user}
                selectedCharacter={this.state.selectedCharacter}
                setDifferences={this.setDifferences}
                timeElapsed = {this.state.timeElapsed}
                setCurrentStep = {this.setCurrentStep}
              />
            }} />
          <Route path="/makeRecord/5-editing" render = {(props) => {
              return <App_5Editing {...props} user = {this.props.user}
                timeElapsed={this.state.timeElapsed}
                differences={this.state.differences}
                setEditedResults={this.setEditedResults}
                setCurrentStep = {this.setCurrentStep}
              />
            }} />
          <Route path="/makeRecord/6-finish" render = {(props) => {
              return <App_6Finish {...props} user = {this.props.user}
                timeElapsed={this.state.timeElapsed}
                editedResults={this.state.editedResults}
                setCurrentStep = {this.setCurrentStep}
                resetApp = {this.resetApp}
              />
            }} />
          <Route path="/reports" component = {Reports}/>

          <Route component={_404page} />
        </Switch>
      </div>
    )
  }
}
