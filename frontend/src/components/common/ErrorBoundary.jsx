import { Component } from 'react'

/**
 * Last-resort guard: without it a render error blanks the whole SPA.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p className="u-muted" style={{ margin: '8px 0 20px' }}>
            {this.state.error.message ?? 'Unexpected UI error.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              cursor: 'pointer',
            }}
          >
            Reload the application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
