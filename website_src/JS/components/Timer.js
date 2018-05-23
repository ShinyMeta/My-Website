import PropTypes from 'prop-types';
import React from 'react';


import Loading from './Loading.js'

const propTypes = {
  start_time: PropTypes.any,
  timeElapsed: PropTypes.number.isRequired,
  timerInterval: PropTypes.number,
  setTimerInterval: PropTypes.func,
  setTimeElapsed: PropTypes.func,
  isStopped: PropTypes.bool
}

export default class Timer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }


  ////////////////////
  // REACT METHODS
  ///////////////////

  componentDidMount() {
    if (!this.props.isStopped) {
      const timerInterval = setInterval(this.updateTimer.bind(this), 1000)
      this.props.setTimerInterval(timerInterval)
    }
  }

  componentWillUnmount() {
    if (this.props.timerInterval){
      clearInterval(this.props.timerInterval)
    }
  }


  ////////////////////
  // EVENT HANDLERS
  ///////////////////


  ////////////////////
  // HELPER METHODS
  ///////////////////
  updateTimer() {
    if (this.props.start_time !== 'pending') {
      this.props.setTimeElapsed (Date.now() - this.props.start_time)
    }
  }

  msToTimerString(ms) {
    let hours = Math.floor(ms/(1000*60*60))
    let minutes = Math.floor((ms%(1000*60*60))/(1000*60))
    let seconds = Math.floor((ms%(1000*60))/1000)

    if (hours < 10) hours = '0' + hours
    if (minutes < 10) minutes = '0' + minutes
    if (seconds < 10) seconds = '0' + seconds

    return hours+':'+minutes+':'+seconds
  }


  ////////////////////
  // RENDER METHODS
  ///////////////////
  renderTimer() {
    if (this.props.start_time === 'pending') {
      return <Loading />
    }
    else {
      return <span>{this.msToTimerString(this.props.timeElapsed)}</span>
    }
  }


  render() {
    return (
      <div>
        {this.renderTimer()}
      </div>
    )
  }
}

Timer.propTypes = propTypes
