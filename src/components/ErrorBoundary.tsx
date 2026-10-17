import React from 'react';

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
};

const ComponentBase = React.Component as unknown as new (props: Props) => {
  props: Props;
  state: State;
  setState(s: Partial<State>): void;
};

// Catches render crashes anywhere in the tree and shows a recovery UI
// instead of a blank white page.
export class ErrorBoundary extends ComponentBase {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }): void {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-8">
          <div className="max-w-md text-center bg-[#FCFBF8] border border-[#E8E0D1] rounded-2xl p-8 shadow-sm">
            <div className="text-4xl mb-4">🕌</div>
            <h2 className="font-editorial text-xl font-bold text-[#0B332D] mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              This section couldn't load. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-[#0B332D] text-white rounded-lg text-sm font-semibold hover:bg-[#07221E]"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
