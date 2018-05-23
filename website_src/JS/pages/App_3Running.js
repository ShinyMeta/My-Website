import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react';

import Timer from '../components/Timer.js'


const propTypes = {
  start_time: PropTypes.number,
  timeElapsed: PropTypes.number,
  timerInterval: PropTypes.number,
  setTimerInterval: PropTypes.func.isRequired,
  setTimeElapsed: PropTypes.func.isRequired,
  setEndTime: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
}
export default class App_3Running extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  ////////////////////
  // REACT METHODS
  ///////////////////


  ////////////////////
  // EVENT HANDLERS
  ///////////////////
  onStopClick(e) {
    //stop timer (this happens automatically when it un-renders)
    //send stop time to server
    const end_time = Date.now()
    axios.post('/gw2data/stopTimeRecord', {end_time})
    this.props.setEndTime(end_time)
    //move to 4-stopped
    this.props.history.push('./4-stopped')
  }


  ////////////////////
  // HELPER METHODS
  ///////////////////


  ////////////////////
  // RENDER METHODS
  ///////////////////


  render() {
    return (
      <div>
        <Timer start_time={this.props.start_time}
          timeElapsed = {this.props.timeElapsed}
          timerInterval = {this.props.timerInterval}
          setTimerInterval = {this.props.setTimerInterval}
          setTimeElapsed = {this.props.setTimeElapsed}
         />
        <div>
          Your starting state has been saved, and you can safely close this page if necessary.
          <br />When you are ready to stop recording your data, click the button.
        </div>
        <button type="button" onClick = {this.onStopClick.bind(this)}>STOP RECORDING</button>
      </div>
    )
  }
}
App_3Running.propTypes = propTypes
