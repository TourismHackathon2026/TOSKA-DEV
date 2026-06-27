import { Component } from 'react';
import { Mountain, RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F4F6F5',
            fontFamily: "'Inter', sans-serif",
            padding: '2rem',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
              padding: '3rem',
              maxWidth: '480px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: '#FEF2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <AlertTriangle size={28} color="#D32F2F" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: '0.75rem' }}>
              <Mountain size={18} color="#00965E" />
              <span style={{ fontWeight: 800, fontSize: 18, color: '#1E293B', fontFamily: "'Outfit', sans-serif" }}>
                TrailGuard Nepal
              </span>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              The application encountered an error. This is usually caused by missing Firebase credentials.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 10,
                  padding: '0.75rem 1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                }}
              >
                <code style={{ fontSize: 11, color: '#B91C1C', wordBreak: 'break-word' }}>
                  {this.state.error.message}
                </code>
              </div>
            )}

            <div
              style={{
                background: '#E5F5EE',
                border: '1px solid #C2EAD9',
                borderRadius: 10,
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
              }}
            >
              <p style={{ fontSize: 12, color: '#005A3C', fontWeight: 600, marginBottom: 4 }}>💡 Quick Fix:</p>
              <p style={{ fontSize: 12, color: '#005A3C', lineHeight: 1.6 }}>
                Add your Firebase credentials to <code style={{ background: '#C2EAD9', padding: '1px 4px', borderRadius: 4 }}>.env</code> in the project root, then restart the server.
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0.625rem 1.5rem',
                borderRadius: 10,
                background: '#00965E',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 13,
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              <RefreshCw size={14} />
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
