import PropTypes from 'prop-types'
import React from 'react'

import Item from '../components/Item.js'

const propTypes = {
  items: PropTypes.array.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
}
export default class ResultItems extends React.Component {
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
  renderItems() {
    //go through each item, add difference attr, and render item
    let itemComponents = this.props.items.map((item) => {
      return <Item item = {item} key = {item.item_id}
        onDoubleClick={this.props.onDoubleClick}/>
    })
    return itemComponents
  }


  render() {
    return (
      <div style={{width: '640px'}}>
        <h4>Items</h4>
        {this.renderItems()}
      </div>
    )
  }
}

ResultItems.propTypes = propTypes
