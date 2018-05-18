import axios from 'axios'
import React from 'react'
import { Route, Switch, Redirect, withRouter } from 'react-router-dom'


//components
import Header from './components/Header'

//pages
import Home from './pages/Home.js'
import Login from './pages/Login.js'




class Layout extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
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
    if (user){
      //if user changes to logged in, change page to app
      if (user != this.state.user) {
        this.setState({user})
      }
    }
    //if user changes to null/logged out, change page to login
    else {
      this.setState({user})
    }
  }






  render() {
    return (
      <div>
        <Header />
        <Switch>
          <Route path = "/login" render={() => {
              return <Login user = {this.state.user}
                      setUser = {this.setUser.bind(this)}/>
            }}/>
          <Route path = "/" render={(props) => {
              return <Home {...props} user = {this.state.user}
                      setUser = {this.setUser.bind(this)}/>
            }}/>
        </Switch>
      </div>
    )
  }
}
export default withRouter(Layout)
