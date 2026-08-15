import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('customer'); // 'customer' or 'staff'
  const [staffPassword, setStaffPassword] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getApiUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return `https://${window.location.hostname}:5000`;
  };

  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/api/staff-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: staffPassword }),
        credentials: 'include'
      });

      if (response.ok) {
        onLoginSuccess(null, true); // true = staff mode
      } else {
        setError('Incorrect password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!apiToken) {
      setError('Please enter API token');
      return;
    }

    // Assume customer login successful
    onLoginSuccess(apiToken);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>💅 Salon Hub</h1>
          <p>Check-in + Network Security Suite</p>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'customer' ? 'active' : ''}`}
            onClick={() => { setMode('customer'); setError(''); }}
          >
            Customer
          </button>
          <button
            className={`login-tab ${mode === 'staff' ? 'active' : ''}`}
            onClick={() => { setMode('staff'); setError(''); }}
          >
            Staff
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        {mode === 'customer' ? (
          <form onSubmit={handleCustomerLogin} className="login-form">
            <h2>Customer Login</h2>
            <div className="form-group">
              <label htmlFor="apiToken">API Token</label>
              <input
                id="apiToken"
                type="password"
                placeholder="Enter your API token"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Access Dashboard
            </button>
            <p className="login-hint">
              Don't have a token? Contact your salon administrator.
            </p>
          </form>
        ) : (
          <form onSubmit={handleStaffLogin} className="login-form">
            <h2>Staff Login</h2>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter staff password"
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Logging in...' : 'Login to Staff Panel'}
            </button>
            <p className="login-hint">
              Staff members only. Use your salon access password.
            </p>
          </form>
        )}

        <div className="login-features">
          <h3>Features</h3>
          <ul>
            <li>✂️ Customer Check-in</li>
            <li>🔒 Network Security Audit</li>
            <li>📊 Analytics & Reports</li>
            <li>💳 Subscription Management</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
