import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
import { withRouter } from 'react-router-dom'

//components

const propTypes = {
  user: PropTypes.object,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
}
class UpdateRef extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      updateMessage: ''
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // REACT METHODS
  ////////////////////


  //////////////////////////////////////////////////////////////////////////////
  // EVENT HANDLERS
  ///////////////////
  onUpdateClick() {
    this.setState({updateMessage: 'waiting for confirmation'})
    axios.post('/gw2data/gw2refUpdate', {
      username: this.state.username,
      password: this.state.password
    }).then((res) => {
      //res should be 200 if no error
      this.setState({updateMessage: 'update successful'})
      console.log(res)
    })
    .catch((err) => {
      console.error(err)
      this.setState({updateMessage: `Error occurred: ${err.message}`})

    })


  }

  //////////////////////////////////////////////////////////////////////////////
  // HELPER METHODS
  ///////////////////


  //////////////////////////////////////////////////////////////////////////////
  // RENDER METHODS
  ///////////////////


  render() {
    //this thing just has links to reports and make record
    if (this.props.user.username.toLowerCase() == 'shinymeta') {
      return (
        <div>
          <button type="button" onClick={this.onUpdateClick.bind(this)}>Update Ref Tables</button>
          <span>{this.state.updateMessage}</span>
        </div>
      )
    }
    else {
      return null
    }
  }
}

UpdateRef.propTypes = propTypes

export default withRouter(UpdateRef)
