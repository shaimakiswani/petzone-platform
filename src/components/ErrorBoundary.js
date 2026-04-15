"use client";

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Layout Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md">
            <span className="text-6xl mb-4 block">🐾</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We encountered a minor technical glitch. Please try refreshing the page or going back to the home page.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-brand-500 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
