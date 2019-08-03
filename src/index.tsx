import React from 'react'
import ReactDOM from 'react-dom'
import { App } from './App'
import { ServiceWorker } from './ServiceWorker'

ReactDOM.render(
  <ServiceWorker>
    <App />
  </ServiceWorker>,
  document.getElementById('root')
)
