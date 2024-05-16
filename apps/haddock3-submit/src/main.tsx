import React from 'react'
import ReactDOM from 'react-dom'
import { Wrapper } from '@i-vresse/wb-core'
import './index.css'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <Wrapper>
      <App />
    </Wrapper>
  </React.StrictMode>,
  document.getElementById('root')
)
