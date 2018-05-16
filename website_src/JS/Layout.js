import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
import { Route, Switch, Redirect, withRouter } from 'react-router-dom'


//components
import Header from './components/Header'

//pages
import _404page from './pages/_404page.js'
import App from './pages/App.js'
import Home from './pages/Home.js'
import Login from './pages/Login.js'




class Layout extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      // authenticated: false
    }

    this.setUser = this.setUser.bind(this)

  }

  componentDidMount() {
    axios.get('/gw2data/user')
      .then((res) => {
        let user = res.data
        this.setUser(user)
      })
      .catch((err) => {
        this.setUser(null)
      })
  }




  setUser(user) {
    // let authenticated
    if (user){
      //if user changes to logged in, change page to app
      if (user != this.state.user) {
        // authenticated = true
        this.setState({user/*, authenticated*/})
      }
    }
    //if user changes to null/logged out, change page to login
    else {
      // authenticated = false
      this.setState({user/*, authenticated*/})
    }
  }






  render() {

    // if (this.state.user && this.props.location.pathname != '/') {
    //   return <Redirect to = '/' />
    // }

    return (
      <div>
        <Header />
        <Switch>
          <Route path = "/login" component={() => {
              return <Login user = {this.state.user}
                      setUser = {this.setUser.bind(this)}/>
            }}/>
          <Route path = "/" component={(props) => {
              return <Home {...props} user = {this.state.user}
                      setUser = {this.setUser.bind(this)}/>
            }}/>
          {/* <Route component={_404page} /> */}
        </Switch>
      </div>
    )
  }
}
export default withRouter(Layout)
