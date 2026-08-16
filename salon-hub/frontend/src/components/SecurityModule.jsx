import React, { useState } from 'react';

function SecurityModule({ apiToken, apiUrl }) {
  const [activeTab, setActiveTab] = useState('wifi');
  const [wifiData, setWifiData] = useState({
    ssid: '',
    password: ''
  });
  const [passwordData, setPasswordData] = useState({
    password: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWifiChange = (e) => {
    const { name, value } = e.target;
    setWifiData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const checkWifiSecurity = async () => {
    setError('');
    setResults(null);
    setLoading(true);

    if (!wifiData.ssid || !wifiData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/scan/wifi-security`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Token': apiToken
        },
        body: JSON.stringify(wifiData)
      });

      const data = await response.json();
      if (response.ok && data.data) {
        setResults({
          ssid: data.data.ssid || '',
          secure: typeof data.data.secure === 'boolean' ? data.data.secure : false,
          issues: Array.isArray(data.data.issues) ? data.data.issues : [],
          recommendations: Array.isArray(data.data.recommendations) ? data.data.recommendations : [],
          type: 'wifi'
        });
      } else {
        setError(data.message || 'WiFi check failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('WiFi check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStrength = async () => {
    setError('');
    setResults(null);
    setLoading(true);

    if (!passwordData.password) {
      setError('Please enter a password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/scan/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Token': apiToken
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();
      if (response.ok && data.data) {
        setResults({
          score: typeof data.data.score === 'number' ? data.data.score : 0,
          strength: data.data.strength || 'Unknown',
          length: typeof data.data.length === 'number' ? data.data.length : 0,
          feedback: Array.isArray(data.data.feedback) ? data.data.feedback : [],
          type: 'password'
        });
      } else {
        setError(data.message || 'Password check failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Password check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (score) => {
    if (score <= 1) return '#ef4444';
    if (score <= 2) return '#f59e0b';
    if (score <= 3) return '#f59e0b';
    if (score <= 4) return '#10b981';
    return '#10b981';
  };

  const getSecurityStatus = (secure) => {
    return secure ? '✅ Secure' : '⚠️ Needs Improvement';
  };

  return (
    <div className="security-module">
      <div className="card">
        <div className="card-header">
          <h2>🔒 Network Security Audit</h2>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
          <button
            className="btn"
            style={{
              backgroundColor: activeTab === 'wifi' ? '#ec4899' : '#e5e7eb',
              color: activeTab === 'wifi' ? 'white' : '#1f2937'
            }}
            onClick={() => setActiveTab('wifi')}
          >
            📡 WiFi Security
          </button>
          <button
            className="btn"
            style={{
              backgroundColor: activeTab === 'password' ? '#ec4899' : '#e5e7eb',
              color: activeTab === 'password' ? 'white' : '#1f2937'
            }}
            onClick={() => setActiveTab('password')}
          >
            🔐 Password Strength
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {activeTab === 'wifi' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>📡 WiFi Security Check</h3>
            <div className="form-group">
              <label htmlFor="ssid">Network Name (SSID)</label>
              <input
                id="ssid"
                type="text"
                name="ssid"
                value={wifiData.ssid}
                onChange={handleWifiChange}
                placeholder="Enter your WiFi network name"
                maxLength="32"
              />
            </div>
            <div className="form-group">
              <label htmlFor="wifiPassword">WiFi Password</label>
              <input
                id="wifiPassword"
                type="password"
                name="password"
                value={wifiData.password}
                onChange={handleWifiChange}
                placeholder="Enter your WiFi password"
                maxLength="128"
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={checkWifiSecurity}
              disabled={loading}
            >
              {loading ? 'Checking...' : '🔍 Check WiFi Security'}
            </button>
          </div>
        )}

        {activeTab === 'password' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>🔐 Password Strength Check</h3>
            <div className="form-group">
              <label htmlFor="password">Password to Test</label>
              <input
                id="password"
                type="password"
                name="password"
                value={passwordData.password}
                onChange={handlePasswordChange}
                placeholder="Enter a password to check"
                maxLength="128"
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={checkPasswordStrength}
              disabled={loading}
            >
              {loading ? 'Checking...' : '🔍 Check Password Strength'}
            </button>
          </div>
        )}

        {results && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ marginBottom: '1rem' }}>📊 Results</h3>

            {results.type === 'wifi' && (
              <div>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Network Status</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: results.secure ? '#10b981' : '#ef4444' }}>
                      {getSecurityStatus(results.secure)}
                    </p>
                  </div>
                  <div style={{ fontSize: '2rem' }}>
                    {results.secure ? '✅' : '⚠️'}
                  </div>
                </div>

                {results.issues && results.issues.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.5rem', color: '#ef4444' }}>Issues Found:</h4>
                    <ul style={{ listStyle: 'none', color: '#6b7280' }}>
                      {results.issues.map((issue, idx) => (
                        <li key={idx} style={{ padding: '0.25rem 0' }}>
                          • {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.recommendations && (
                  <div>
                    <h4 style={{ marginBottom: '0.5rem', color: '#10b981' }}>Recommendations:</h4>
                    <ul style={{ listStyle: 'none', color: '#6b7280' }}>
                      {results.recommendations.map((rec, idx) => (
                        <li key={idx} style={{ padding: '0.25rem 0' }}>
                          ✓ {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {results.type === 'password' && (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    Strength Score: {results.score}/5
                  </p>
                  <div style={{
                    backgroundColor: '#e5e7eb',
                    borderRadius: '8px',
                    height: '8px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(results.score / 5) * 100}%`,
                      height: '100%',
                      backgroundColor: getStrengthColor(results.score),
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'white', borderRadius: '6px', border: `2px solid ${getStrengthColor(results.score)}` }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: getStrengthColor(results.score) }}>
                    {results.strength}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Length: {results.length} characters
                  </p>
                </div>

                {results.feedback && results.feedback.length > 0 && (
                  <div>
                    <h4 style={{ marginBottom: '0.5rem', color: '#f59e0b' }}>How to Improve:</h4>
                    <ul style={{ listStyle: 'none', color: '#6b7280' }}>
                      {results.feedback.map((tip, idx) => (
                        <li key={idx} style={{ padding: '0.25rem 0' }}>
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#dbeafe', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
          <h4 style={{ marginBottom: '0.5rem', color: '#0c4a6e' }}>💡 Security Tips</h4>
          <ul style={{ fontSize: '0.875rem', color: '#0c4a6e', listStyle: 'none' }}>
            <li>✓ Use passwords with at least 12 characters</li>
            <li>✓ Include uppercase, lowercase, numbers, and symbols</li>
            <li>✓ Change WiFi password every 90 days</li>
            <li>✓ Disable WPS (WiFi Protected Setup)</li>
            <li>✓ Keep router firmware updated</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SecurityModule;
