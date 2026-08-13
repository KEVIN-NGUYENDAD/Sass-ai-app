import React, { useState, useEffect } from 'react';
import './App.css';
import { PortScanner, PasswordChecker, WiFiSecurityChecker, NetworkInfo, ScanHistory, Dashboard } from './components';
import { useLanguage } from './i18n';

function App() {
  // HTTPS enforcement for production
  useEffect(() => {
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
      window.location.href = window.location.href.replace('http://', 'https://');
    }
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [scanHistory, setScanHistory] = useState([]);
  const [apiUrl] = useState(() => {
    const configured = process.env.REACT_APP_API_URL;
    if (configured) return configured;

    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5000';
    }

    const protocol = window.location.protocol === 'https:' ? 'https:' : 'https:';
    return `${protocol}//${window.location.host}/api`;
  });
  const [apiToken] = useState(process.env.REACT_APP_API_TOKEN || '');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'vi');
  const [apiConnected, setApiConnected] = useState(null);

  const strings = useLanguage(language);

  // Load scan history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('scanHistory');
    if (saved) {
      try {
        setScanHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
    checkApiConnection();
  }, []);

  // Save scan history to localStorage
  useEffect(() => {
    localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
  }, [scanHistory]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const checkApiConnection = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/health`, { timeout: 5000 });
      setApiConnected(response.ok);
    } catch (error) {
      console.warn('⚠ Backend not available:', error.message);
      setApiConnected(false);
    }
  };

  const addToHistory = (scan) => {
    const record = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US'),
      ...scan
    };
    setScanHistory([record, ...scanHistory]);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-top">
            <div>
              <h1>{strings.app.title}</h1>
              <p>{strings.app.description}</p>
            </div>
            <div className="language-toggle">
              <button
                className={`lang-btn ${language === 'vi' ? 'active' : ''}`}
                onClick={() => setLanguage('vi')}
                aria-label="Switch to Vietnamese"
                title="Tiếng Việt"
              >
                VI
              </button>
              <button
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
                aria-label="Switch to English"
                title="English"
              >
                EN
              </button>
            </div>
          </div>
          {apiConnected === false && (
            <div className="alert alert-warning">
              ⚠️ {strings.common.backendError}
            </div>
          )}
        </div>
      </header>

      <nav className="nav-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'dashboard'}
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          {strings.nav.dashboard}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'port-scan'}
          className={`nav-btn ${activeTab === 'port-scan' ? 'active' : ''}`}
          onClick={() => setActiveTab('port-scan')}
        >
          {strings.nav.portScan}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'password'}
          className={`nav-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          {strings.nav.passwordChecker}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'wifi'}
          className={`nav-btn ${activeTab === 'wifi' ? 'active' : ''}`}
          onClick={() => setActiveTab('wifi')}
        >
          {strings.nav.wifiSecurity}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'network-info'}
          className={`nav-btn ${activeTab === 'network-info' ? 'active' : ''}`}
          onClick={() => setActiveTab('network-info')}
        >
          {strings.nav.networkInfo}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'history'}
          className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          {strings.nav.history}
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard apiUrl={apiUrl} apiToken={apiToken} strings={strings} language={language} />}
        {activeTab === 'port-scan' && <PortScanner apiUrl={apiUrl} apiToken={apiToken} onScan={addToHistory} strings={strings} />}
        {activeTab === 'password' && <PasswordChecker apiUrl={apiUrl} apiToken={apiToken} onCheck={addToHistory} strings={strings} />}
        {activeTab === 'wifi' && <WiFiSecurityChecker apiUrl={apiUrl} apiToken={apiToken} onCheck={addToHistory} strings={strings} />}
        {activeTab === 'network-info' && <NetworkInfo apiUrl={apiUrl} apiToken={apiToken} strings={strings} />}
        {activeTab === 'history' && <ScanHistory history={scanHistory} strings={strings} />}
      </main>

      <footer className="footer">
        <p>🏠 {strings.common.made}</p>
      </footer>
    </div>
  );
}

export default App;
