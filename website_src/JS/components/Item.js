import PropTypes from 'prop-types'
import React from 'react'

const propTypes = {
  item: PropTypes.any,
  /*  name
      description (optional)
      icon
      quantity(+green/-red)/count(white)
      item_id (if null, renders unknown)
  */
  onDoubleClick: PropTypes.func,
  noQuantity: PropTypes.bool,
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

  renderItem() {
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

  renderQuantity() {
    if (this.props.noQuantity) {return}
    const item = this.props.item
    if (!item.quantity && item.count > 1)
      return <div style={{position: 'absolute', top: '2px', right: '2px', color: 'white'}}
                title={item.count}>{item.count}</div>
    if (item.quantity >= 0)
      return <div style={{position: 'absolute', bottom: '2px', right: '2px', color: '#5dd55d'}}
                title={'+'+item.quantity}>+{item.quantity}</div>
    if (item.quantity < 0)
      return <div style={{position: 'absolute', bottom: '2px', right: '2px', color: '#e06c6c'}}
                title={item.quantity}>{item.quantity}</div>
  }

  renderEmpty() {
    return <img src="/Images/gw2data/empty_item_slot.png" title="Empty"/>
  }

  renderUnknown() {
    return <img src="/Images/gw2data/unknown_item_slot.png" title="Unknown item"/>
  }


  render() {
    let style = {
      float: 'left',
      height: '64px',
      width: '64px',
      position:'relative',
      textAlign:'center',
      fontWeight: 'bold',
      textShadow: '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black'
    }
    if (!this.props.item) {
      return (<div
          className="Item"
          style={style} onDoubleClick = {this.props.onDoubleClick}>
            {this.renderEmpty()}
        </div>)
    } else if (!this.props.item.item_id) {
      return (<div
          className="Item"
          style={style} onDoubleClick = {this.props.onDoubleClick}>
            {this.renderUnknown()}
        </div>)
    } else {
      return (<div
          className="Item" item_id = {this.props.item.item_id}
          style={style} onDoubleClick = {this.props.onDoubleClick}>
            {this.renderItem()}
        </div>)
    }
  }
}
Item.propTypes = propTypes
