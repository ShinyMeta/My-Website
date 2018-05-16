import React from 'react'
import { Link } from 'react-router-dom'

export default class _404page extends React.Component {
  render() {
    return (
      <div>
        <h2>{'Uh-oh. Looks like you got lost (Error 404: Page not found)'}</h2>
        <Link to="/">Homepage</Link>
      </div>
    )
  }
}
