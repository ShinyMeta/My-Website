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

  


  render() {
    return (
      <div style={{float: 'left', width: '55px'}}>
        {this.props.item ? this.props.item.id: '(empty)'}
      </div>
    )
  }
}
