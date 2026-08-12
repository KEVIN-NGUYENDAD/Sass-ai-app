import React, { useState, useEffect } from 'react';
import './App.css';
import { PortScanner, PasswordChecker, WiFiSecurityChecker, NetworkInfo, ScanHistory, Dashboard } from './components';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scanHistory, setScanHistory] = useState([]);
  const [apiUrl] = useState(process.env.REACT_APP_API_URL || 'http://localhost:5000');

  // Load scan history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('scanHistory');
    if (saved) {
      setScanHistory(JSON.parse(saved));
    }
    checkApiConnection();
  }, []);

  // Save scan history to localStorage
  useEffect(() => {
    localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
  }, [scanHistory]);

  const checkApiConnection = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/health`);
      if (response.ok) {
        console.log('✓ Backend connected');
      }
    } catch (error) {
      console.warn('⚠ Backend not available:', error.message);
    }
  };

  const addToHistory = (scan) => {
    const record = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      ...scan
    };
    setScanHistory([record, ...scanHistory]);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🔒 Network Security Audit</h1>
          <p>Kiểm toán an ninh mạng cho gia đình</p>
        </div>
      </header>

      <nav className="nav-tabs">
        <button
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-btn ${activeTab === 'port-scan' ? 'active' : ''}`}
          onClick={() => setActiveTab('port-scan')}
        >
          🔍 Quét Cổng
        </button>
        <button
          className={`nav-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          🔐 Kiểm Tra Mật Khẩu
        </button>
        <button
          className={`nav-btn ${activeTab === 'wifi' ? 'active' : ''}`}
          onClick={() => setActiveTab('wifi')}
        >
          📡 WiFi Security
        </button>
        <button
          className={`nav-btn ${activeTab === 'network-info' ? 'active' : ''}`}
          onClick={() => setActiveTab('network-info')}
        >
          ℹ️ Network Info
        </button>
        <button
          className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 Lịch Sử
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard apiUrl={apiUrl} />}
        {activeTab === 'port-scan' && <PortScanner apiUrl={apiUrl} onScan={addToHistory} />}
        {activeTab === 'password' && <PasswordChecker apiUrl={apiUrl} onCheck={addToHistory} />}
        {activeTab === 'wifi' && <WiFiSecurityChecker apiUrl={apiUrl} onCheck={addToHistory} />}
        {activeTab === 'network-info' && <NetworkInfo apiUrl={apiUrl} />}
        {activeTab === 'history' && <ScanHistory history={scanHistory} />}
      </main>

      <footer className="footer">
        <p>🏠 Family Network Security Audit Tool | Made with ❤️ by Your Security Team</p>
      </footer>
    </div>
  );
}

export default App;
