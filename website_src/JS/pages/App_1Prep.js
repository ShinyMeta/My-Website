import React from 'react';

import App_1PrepSelect from '../components/App_1PrepSelect.js'

export default class App_1Prep extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      characters: null
    }

  }



  ////////////////
  // Event handlers
  ////////////////
  handleSelectChange(e) {
    const character = e.target.value
    this.props.setSelectedCharacter(character)
  }
  onClick(e) {
    this.props.history.push('/makeRecord/2-start')
  }



  render() {
    return (
      <div>
        <App_1PrepSelect onChange={this.handleSelectChange.bind(this)} user = {this.props.user}/>
        <button type="button" disabled={!this.props.selectedCharacter} onClick={this.onClick.bind(this)}>Select</button>
          <br />
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
