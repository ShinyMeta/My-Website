import React from 'react'
import axios from 'axios'
import {Redirect} from 'react-router'

export default class LoginForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      errorMessage: ''
    }
  }

  onSubmit(e) {
    e.preventDefault()
    axios.post('/gw2data/login', {
      username: this.state.username,
      password: this.state.password
    }).then((res) => {
      //res should have my user
      let user = res.data
      this.props.setUser(user)
      // this.props.history.push('/')
    })
    .catch((err) => {
      console.error()
      if (err.response && err.response.status === 401)
        this.setState(() =>({errorMessage:
            'You have entered an incorrect username/password combination, please try again.'}))
    })
  }
  onChange(e) {
    const {id, value} = e.target
    this.setState(() => ({[id]: value}))
  }


  render() {
    return (
      <div style={{float: 'left', width: '300px'}}>
        <h3>User Login</h3>

        <form onSubmit = {this.onSubmit.bind(this)}>

          <label>Username:</label>
          <input type = "text" name = "username" id = "username"
              onChange = {this.onChange.bind(this)} required/>
            <br/>
          <label>Password:</label>
          <input type = "password" name = "password" id = "password"
              onChange = {this.onChange.bind(this)} required/>
            <br/>
          <input type = "submit" value = "Log In" />
          <label id="errorMessage" style={{color: 'red'}}>{this.state.errorMessage}</label>

        </form>
      </div>

    )
  }
}
