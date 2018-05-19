import React from 'react';


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

  renderItemImage() {
    if (!this.props.item){
      return <img src="../Images/gw2data/empty_item_slot.png" title="Empty"/>
    }
    else if (this.props.item === 'unknown') {
      return <img src="../Images/gw2data/unknown_item_slot.png" title="Unknown item"/>
    }
    else {
      return <img src={this.props.item.icon} title={this.props.item.name +
        '\n' + this.props.item.description}/>
    }

  }


  render() {
    return (
      <div style={{float: 'left', width: '64px', height: '64px'}}>
        {this.renderItemImage()}
      </div>
    )
  }
}
