import axios from 'axios'
import React from 'react'
import { Route, Switch, Redirect, withRouter } from 'react-router-dom'


//components
import Header from './components/Header'
import Loading from './components/Loading'
import NavBar from './components/NavBar'
import PageContent from './components/PageContent'





class Layout extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      userFetchDone: false,
    }

    this.setUser = this.setUser.bind(this)

  }

  setUser(user) {
    if (!user || user != this.state.user){
      this.setState({user})
    }
  }






  //////////////////////////////////////////////////////////////////////////////
  // REACT METHODS
  ////////////////////
  componentDidMount() {
    axios.get('/gw2data/user')
    .then((res) => {
      let user = res.data
      this.setState({user, userFetchDone: true})
    })
    .catch((err) => {
      this.setState({user: null, userFetchDone: true})
    })
  }


  //////////////////////////////////////////////////////////////////////////////
  // EVENT HANDLERS
  ///////////////////
  handleLogoutClick(e) {
    //send logout to server to destroy session
    axios.post('/gw2data/logout')
      .then((res) => {
        //setUser on page to null
        this.setState({user: null})
      })
      .catch((err) => {
        console.log('there was an error communicating with the server')
        console.error(err)
      })
  }


  //////////////////////////////////////////////////////////////////////////////
  // HELPER METHODS
  ///////////////////


  //////////////////////////////////////////////////////////////////////////////
  // RENDER METHODS
  ///////////////////

  render() {

    return (
      <div>
        <Header />
        <NavBar user = {this.state.user}
            userFetchDone = {this.state.userFetchDone}
            handleLogoutClick = {this.handleLogoutClick.bind(this)} />
        <PageContent user = {this.state.user}
            userFetchDone = {this.state.userFetchDone}
            setUser = {this.setUser.bind(this)} />

      </div>
    )
  }
}
export default withRouter(Layout)
