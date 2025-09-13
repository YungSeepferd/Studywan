import React, { type ReactNode } from 'react'

type State = { hasError: boolean; message?: string }

type Props = { fallback?: ReactNode; children?: ReactNode }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: String(error?.message || error) }
  }
  override componentDidCatch(error: Error, _errorInfo: any) {
    // noop: could log to analytics later
  }
  override render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, color: '#c00' }}>
          Something went wrong. <button onClick={() => this.setState({ hasError: false, message: '' })}>Retry</button>
          {this.state.message ? <div style={{ marginTop: 6, color: '#666' }}>{this.state.message}</div> : null}
        </div>
      )
    }
    return this.props.children as ReactNode
  }
}
