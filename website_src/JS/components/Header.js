import React from 'react';
import { Link } from 'react-router-dom'


export default class Header extends React.Component {


  render() {
    return (
      <div>
        <Link to="/"> <h1>{'GW2 Data Recorder'}</h1> </Link>
      </div>
    )
  }
}
