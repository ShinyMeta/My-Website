import axios from 'axios'
import React from 'react'
import { Redirect } from 'react-router-dom'

import gw2API from '../../../server_routes/gw2tools/gw2API.js'

import SignupPasswordFields from './SignupPasswordFields'
// import SignupUsernameField from './SignupUsernameField'
// import SignupEmailField from './SignupEmailField'
import SignupApikeyField from './SignupApikeyField'

export default class SignupForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      password1: '',
      password2: '',
      email: '',
      apikey: '',
      passwordMatch: null,
      passwordMessage: '',
      apikeyVerified: false,
      apikeyMessage: '',
      submitErrorMessage: ''
    }
  }

  // componentDidChange(prevProps, prevState) {

  //
  //   //if the apikey was edited, update status
  //   if (prevState.apikey !== this.state.apikey) {
  //     this.setState({apikeyVerified:false, apikeymsg:''})
  //   }
  //
  // }


  onSubmit(e) {
    e.preventDefault()
    axios.post('/gw2data/signup', {
      username: this.state.username,
      password: this.state.password1,
      password2: this.state.password2,
      email: this.state.email,
      apikey: this.state.apikey
    }).then((res) => {
      //res should have my user
      let user = res.data
      this.props.setUser(user)
    })
    .catch((err) => {
      if (err.response && err.response.status === 401) {
        //display error message
        const submitErrorMessage = err.response.data
        this.setState({submitErrorMessage})
      }
      //display error message
      console.error(err)
    })
  }

  onTextFieldChange(e) {
    const {name, value} = e.target
    this.setState(() => ({[name]: value}))
  }
  // handleUsernameChange(e) {
  //   this.onTextFieldChange(e)
  // }
  handlePasswordChange(e) {
    const {id, value} = e.target
    this.setState(() => ({[id]: value}),
      () => {
        const prevPasswordMatch = this.state.passwordMatch
        const nowPasswordMatch = this.state.password1 === this.state.password2
        if (prevPasswordMatch != nowPasswordMatch) {
          this.setState(() => ({
            passwordMessage: (nowPasswordMatch ? 'OK' : 'Passwords do not match'),
            passwordMatch: nowPasswordMatch
          }))
        }
      }
    )
  }

  handleApikeyChange(e) {
    const value = e.target.value
    this.setState(() => ({apikey: value, apikeyMessage: '', apikeyVerified: false}))
  }
  handleApikeyVerify(e) {
    //send request to gw2 api
    this.setState(() => ({apikeyMessage: 'Verifying...'}))
    gw2API.apikeyInfo(this.state.apikey)
      .then((res) => {
        const permissions = res.data.permissions
        let wallet = permissions.find((x) => x == 'wallet')
        let inventories = permissions.find((x) => x == 'inventories')

        if (wallet && inventories) {
          this.setState(() => ({apikeyVerified: true, apikeyMessage: 'VERIFIED'}))
        } else {
          this.setState(() => ({apikeyVerified: false, apikeyMessage: 'The apikey is missing permissions for wallet and/or inventory'}))
        }
      })
      .catch((err) => {
        console.error (err)
        this.setState(() => ({apikeyVerified: false, apikeyMessage: 'Please enter a valid API key'}))
      })
  }










  render() {
    if (this.props.user != null) {
      return <Redirect to = '/app' />
    }

    return (
      <div style={{float: 'left', width: '550px'}}>
        <h3>Register</h3>

        <form onSubmit={this.onSubmit.bind(this)}>

          <label>Username:</label>
          <input type = "text" name = "username" required
              onChange = {this.onTextFieldChange.bind(this)} />

          <SignupPasswordFields onChange = {this.handlePasswordChange.bind(this)}
              message = {this.state.passwordMessage}
              matching = {this.state.passwordMatch}/>

          <label>Email:</label>
          <input type = "text" name = "email" required
              onChange = {this.onTextFieldChange.bind(this)} />

          <SignupApikeyField onChange = {this.handleApikeyChange.bind(this)}
              message = {this.state.apikeyMessage}
              verified = {this.state.apikeyVerified}
              onClick = {this.handleApikeyVerify.bind(this)}/>
            <br/>

          <input type = "submit" value = "Signup" id = "signupButton"
              title = "You must fill out form completely and
      verify API key before submitting" style = {{pointerEvents: 'auto'}}
              disabled = {!this.state.passwordMatch | !this.state.apikeyVerified}/>
          <label style = {{color: 'red'}}>{this.state.submitErrorMessage}</label>
        </form>
      </div>
    )
  }
}
