import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { Wrapper } from '@i-vresse/wb-core'

ReactDOM.render(
  <React.StrictMode>
    <Wrapper>
      <App />
    </Wrapper>
  </React.StrictMode>,
  document.getElementById('root')
)
