import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from './ui/Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(_error, info) {
    console.error('System Error:', _error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0c0c0c] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-md space-y-8 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/10 blur-[100px] rounded-full" />
              <div className="relative size-24 mx-auto rounded-[32px] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-8">
                <AlertTriangle size={48} strokeWidth={1.5} />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Something went wrong</h1>
              <p className="text-sm text-white/40 font-medium">
                 An unexpected error has occurred. Please reload the application.
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-8">
              <Button 
                onClick={() => window.location.reload()}
                className="h-16 rounded-2xl bg-white text-black font-bold uppercase tracking-widest hover:bg-white/90"
              >
                <RefreshCcw size={18} className="mr-2" /> Reload Application
              </Button>
              
              <Button 
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="h-16 rounded-2xl border border-white/5 text-white/40 hover:text-white"
              >
                <Home size={18} className="mr-2" /> Return to Dashboard
              </Button>
            </div>

            <p className="text-[10px] text-white/10 uppercase tracking-widest pt-12">
               LockIn Fitness • Error Recovery System
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
