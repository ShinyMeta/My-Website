import React from 'react';
import { Redirect } from 'react-router-dom'


export default class Header extends React.Component {

  onReportsClick() {
    this.props.history.push('/reports')
  }

  onBeginClick() {
    this.props.history.push('/makeRecord/1-prep')
  }


  render() {
    return (
      <div>
        <h4>To start or resume making a record:</h4>
        <button type="button" onClick={this.onBeginClick.bind(this)}>Click here</button>
        <h4>To view reports:</h4>
        <button type="button" onClick={this.onReportsClick.bind(this)}>Click here</button>
        {/* <Redirect to="/1-prep" /> */}
      </div>
    )
  }
}
