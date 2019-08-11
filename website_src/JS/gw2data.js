
import React from 'react';
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'


import App from './App.js'


let root = document.getElementById('root')

ReactDOM.render(
  <BrowserRouter basename="/gw2data">
    <App />
  </BrowserRouter>,
root);
