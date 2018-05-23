import PropTypes from 'prop-types'
import React from 'react'

import Item from './Item.js'

const propTypes = {
  bag: PropTypes.object,
  index: PropTypes.number,
}
export default class InventoryBag extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  ////////////////////
  // REACT METHODS
  ///////////////////


  ////////////////////
  // EVENT HANDLERS
  ///////////////////


  ////////////////////
  // HELPER METHODS
  ///////////////////


  ////////////////////
  // RENDER METHODS
  ///////////////////
  renderItems() {
    if (!this.props.bag) {
      return <div>~Empty~</div>
    }
    return <div>
      {this.props.bag.inventory.map((item, index) => {
        return <Item key={index} item={item} />
      })}
    </div>
  }


  render() {
    return (
      <div style={{width: '640px'}}>
        <div>Bag {this.props.index + 1}:</div>
        {this.renderItems()}
      </div>
    )
  }
}

InventoryBag.propTypes = propTypes
