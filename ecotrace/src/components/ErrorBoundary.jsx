import React from 'react';
import PropTypes from 'prop-types';

/**
 * React error boundary — catches unhandled errors in any child component tree
 * and renders a graceful fallback UI instead of a blank crash screen.
 *
 * Usage: wrap each page route in App.jsx with <ErrorBoundary>.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('EcoTrace ErrorBoundary caught:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-cream-100 dark:bg-forest-900">
          <div className="glass-card p-8 max-w-md text-center">
            <div className="text-5xl mb-4" aria-hidden="true">🌿</div>
            <h2 className="text-xl font-bold text-forest-900 dark:text-cream-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-forest-700 dark:text-cream-200 mb-4 text-sm">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn-primary"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
