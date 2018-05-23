import PropTypes from 'prop-types'
import React from 'react'

const propTypes = {
  item: PropTypes.object.isRequired,
  onDoubleClick: PropTypes.func,
}
export default class Item extends React.Component {
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
  renderQuantity() {
    const item = this.props.item
    if (!item.difference && item.count > 1)
      return <div style={{position: 'absolute', top: '2px', right: '2px', color: 'white'}}
        title={item.count}>{item.count}</div>
    if (item.difference >= 0)
      return <div style={{position: 'absolute', bottom: '2px', left: '2px', color: '#5dd55d'}}
        title={'+'+item.difference}>+{item.difference}</div>
    if (item.difference < 0)
      return <div style={{position: 'absolute', bottom: '2px', right: '2px', color: '#e06c6c'}}
        title={item.difference}>{item.difference}</div>
  }

  renderItemImage() {
    if (!this.props.item){
      return <img src="../Images/gw2data/empty_item_slot.png" title="Empty"/>
    }
    else if (this.props.item === 'unknown') {
      return <img src="../Images/gw2data/unknown_item_slot.png" title="Unknown item"/>
    }
    else {
      let tool_tip = this.props.item.name
      if (this.props.item.description) {
        tool_tip += '\n' + this.props.item.description
      }
      return (
        <div style={{backgroundColor: 'black',
          height: '64px', width: '64px'
        }}>
          <img src={this.props.item.icon} title={tool_tip}
            style={{height: '64px', width: '64px'}}
          />
          {this.renderQuantity()}
        </div>
      )
    }

  }


  render() {
    return (
      <div className="Item" item_id = {this.props.item.item_id || this.props.item.id}
        style={{float: 'left', width: '64px', height: '64px', position:'relative',
            textAlign:'center', fontWeight: 'bold', textShadow: '1px 1px black'}}
        onDoubleClick = {this.props.onDoubleClick}
      >
        {this.renderItemImage()}
      </div>
    )
  }
}
Item.propTypes = propTypes
