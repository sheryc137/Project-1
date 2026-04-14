import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card border-red-700/50 text-center py-8">
          <p className="text-red-400 font-medium mb-1">Something went wrong</p>
          <p className="text-slate-500 text-sm">{this.state.error?.message}</p>
          <button
            className="btn-secondary mt-4"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
