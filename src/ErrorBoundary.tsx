import React from 'react'
import { ValidationError } from './validate'

interface State {
  error: Error | null
}

export class ErrorBoundary extends React.Component<{}, State> {
  static getDerivedStateFromError (error: Error): State {
    return { error }
  }

  state: State = {
    error: null
  }

  render (): React.ReactNode {
    if (this.state.error !== null) {
      if (this.state.error instanceof ValidationError) {
        console.error(this.state.error.errors)
      }
      return (
        <div>
          <h1>Something went terribly wrong.</h1>
          <span>{this.state.error.message}</span>
        </div>
      )
    }

    return this.props.children
  }
}
