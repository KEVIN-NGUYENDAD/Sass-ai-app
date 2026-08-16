import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import CheckInModule from './components/CheckInModule';
import SecurityModule from './components/SecurityModule';
import LoginPage from './components/LoginPage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [apiToken, setApiToken] = useState(null);
  const [staffMode, setStaffMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Enforce HTTPS in production
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
      window.location.protocol = 'https:';
    }
  }, []);

  // Load API token from env
  useEffect(() => {
    const token = process.env.REACT_APP_API_TOKEN;
    if (token) {
      setApiToken(token);
    }
  }, []);

  // Get API URL
  const getApiUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return `https://${window.location.hostname}:5000`;
  };

  const handleLoginSuccess = (token, isStaff = false) => {
    setApiToken(token);
    setStaffMode(isStaff);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setApiToken(null);
    setStaffMode(false);
    setActiveTab('dashboard');
  };

  // If not authenticated, show login
  if (!apiToken && !staffMode) {
    return (
      <div className="app">
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <div className="header-left">
            <h1>💅 Salon Hub</h1>
            <p>Check-in + Security Suite</p>
          </div>
          <div className="header-right">
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </header>

        <nav className="app-nav">
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-btn ${activeTab === 'checkin' ? 'active' : ''}`}
            onClick={() => setActiveTab('checkin')}
          >
            ✂️ Check-In
          </button>
          <button
            className={`nav-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔒 Security Audit
          </button>
          {staffMode && (
            <button
              className={`nav-btn ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => setActiveTab('staff')}
            >
              👥 Staff Panel
            </button>
          )}
        </nav>

        <main className="app-main">
          {activeTab === 'dashboard' && (
            <Dashboard
              apiToken={apiToken}
              staffMode={staffMode}
              apiUrl={getApiUrl()}
            />
          )}
          {activeTab === 'checkin' && (
            <CheckInModule
              apiToken={apiToken}
              apiUrl={getApiUrl()}
            />
          )}
          {activeTab === 'security' && (
            <SecurityModule
              apiToken={apiToken}
              apiUrl={getApiUrl()}
            />
          )}
        </main>

        <footer className="app-footer">
          <p>© 2026 Salon Hub | Check-in + Network Security for Nail Salons</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
