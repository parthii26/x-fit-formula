import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[XFF Application Error]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] p-6 text-center text-[#f5f5f5]">
          <div className="max-w-md border border-white/10 bg-[#111111] p-8 shadow-2xl">
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-[#c6a87c]">
              Application Notice
            </h2>
            <p className="mt-3 text-xs text-[#888888]">
              {this.state.error?.message || 'An unexpected state occurred. Click below to reload.'}
            </p>
            <button
              onClick={() => {
                sessionStorage.clear()
                window.location.reload()
              }}
              className="mt-6 border border-[#c6a87c] bg-[#c6a87c] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-[#050505] transition-all hover:bg-white hover:border-white"
            >
              Reset & Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
