

import React from 'react'

export default class SignupEmailField extends React.Component {
  render() {
    const styles = {
      verified: {color: 'green', fontWeight: 'bold'},
      error: {color: 'red', fontWeight: 'normal'},
      wait: {color: 'gray', fontWeight: 'normal'}
    }
    let current
    if (this.props.message == 'Verifying...')   current = styles.wait
    else if (this.props.verified)               current = styles.verified
    else                                        current = styles.error

    return (
      <div>
        <label><a href="https://account.arena.net/applications" target = "_blank" rel='noopener noreferrer'>
          APIKey:</a></label>
        <input type = "text" name = "apikey" id = "apikey" required
          onChange={this.props.onChange}/>

        <label>{"(Must have access to 'wallet,' 'inventories' and 'characters')"}</label>

          <br/>

        <button type = "button" id = "verifyAPIKeyButton"
            onClick = {this.props.onClick}>Verify API Key</button>
        <label id = "apikeyVerifiedMessage" style = {current}>{this.props.message}</label>
      </div>
    )
  }
}
