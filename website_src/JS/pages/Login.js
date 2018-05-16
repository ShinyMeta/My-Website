import React from 'react'
import { Route, Redirect } from 'react-router-dom'


import LoginForm from '../components/LoginForm'
import SignupForm from '../components/SignupForm'

export default class Login extends React.Component {


  render() {
    if (this.props.user) {
      return <Redirect to="/" />
    }

    else {
      return (
        <div>
          <Route path="/login" component = {() => {
            return <LoginForm setUser = {this.props.setUser}/>
          }} />


          <SignupForm setUser = {this.props.setUser}/>

        </div>
      )
    }
  }
}
