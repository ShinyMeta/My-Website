import PropTypes from 'prop-types'
import React from 'react'

import InventoryBag from './InventoryBag.js'
import Loading from '../components/Loading.js'

const propTypes = {
  bags: PropTypes.array,
}
export default class Inventory extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // REACT METHODS
  ///////////////////


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
    if (!this.props.bags){
      return <Loading />
    } else {
      return this.props.bags.map((bag, index) => {
        return <InventoryBag key={index} index={index} bag={bag}/>
      })
    }
  }
}

Inventory.propTypes = propTypes
