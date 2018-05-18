import React from 'react';
import { Redirect } from 'react-router-dom'


export default class Header extends React.Component {

  onClick() {
    this.props.history.push('/1-prep')
  }

  render() {
    return (
      <div>
        <h4>To begin:</h4>
        <button type="button" onClick={this.onClick.bind(this)}>Click here</button>
        {/* <Redirect to="/1-prep" /> */}
      </div>
    )
  }
}
