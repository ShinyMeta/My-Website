import PropTypes from 'prop-types'
import React from 'react'

const propTypes = {

}
export default class MakeRecord_Warning extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // REACT METHODS
  ////////////////////


  //////////////////////////////////////////////////////////////////////////////
  // EVENT HANDLERS
  ///////////////////


  //////////////////////////////////////////////////////////////////////////////
  // HELPER METHODS
  ///////////////////


  //////////////////////////////////////////////////////////////////////////////
  // RENDER METHODS
  ///////////////////


  render() {
    return (
      <div>
        <span>
          WARNING: From this point on, do not do anything that would affect the <br />
          items or currencies associated with your account, besides what you are measuring. <br />
          This includes:
        </span>

        <ul>
          <li>Buying, selling or picking up from the Trading Post</li>
          <li>Selling or buying from any npc vendor</li>
          <li>Mailing or accepting mail from another player</li>
          <li>Buying or reedeeming gems, and converting to/from gold</li>
          <li>{"Changing your character's appearance (this one's a joke)"}</li>
          <li>You get the idea; Only change things that you want to track</li>
        </ul>
      </div>
    )
  }
}

MakeRecord_Warning.propTypes = propTypes
