import React from 'react'

export default class SignupPasswordFields extends React.Component {
  render() {
    const style = {
      fontWeight: (this.props.matching ? 'bold' : 'normal'),
      color: (this.props.matching ? 'green' : 'red'),
    }


    return (
      <div>
        <label>Password:</label>
        <input type = "password" name = "password" id = "password1" required
          onChange={this.props.onChange}/>

          <br/>

        <label>Confirm Password:</label>
        <input type = "password" name = "password2" id = "password2" required
          onChange={this.props.onChange}/>

        <label id = "passwordMatchMessage" style = {style}>
          {this.props.message}
        </label>
      </div>
    )
  }
}
