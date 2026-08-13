import React, { useState, useEffect } from 'react';

// Port Scanner Component
export function PortScanner({ apiUrl, apiToken, onScan, strings }) {
  const [target, setTarget] = useState('localhost');
  const [ports, setPorts] = useState('1-1000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};
    if (!target.trim()) newErrors.target = strings.common.required;
    if (!ports.trim()) newErrors.ports = strings.common.required;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const headers = { 'Content-Type': 'application/json' };
      if (apiToken) headers['X-API-Token'] = apiToken;

      const response = await fetch(`${apiUrl}/api/scan/ports`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ target, ports }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        onScan({
          type: 'port_scan',
          target,
          open_ports_count: data.data.open_ports.length,
          security_score: data.data.security_score
        });
      } else {
        setError(data.error || strings.portScanner.error);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Scan timeout - try fewer ports');
      } else {
        setError(strings.common.connectionError + ': ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>{strings.portScanner.title}</h2>

      <form onSubmit={handleScan}>
        <div className="form-group">
          <label>{strings.portScanner.targetHost}</label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={strings.portScanner.targetHostPlaceholder}
            disabled={loading}
            aria-label={strings.portScanner.targetHost}
          />
          {errors.target && <small style={{ color: 'red' }}>{errors.target}</small>}
        </div>

        <div className="form-group">
          <label>{strings.portScanner.portRange}</label>
          <input
            type="text"
            value={ports}
            onChange={(e) => setPorts(e.target.value)}
            placeholder={strings.portScanner.portRangePlaceholder}
            disabled={loading}
            aria-label={strings.portScanner.portRange}
          />
          <small>{strings.portScanner.example}</small>
          {errors.ports && <small style={{ color: 'red' }}>{errors.ports}</small>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? strings.portScanner.scanning : strings.portScanner.scanButton}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="result-section">
          <h3>{strings.portScanner.results}</h3>

          <div className="security-score">
            <div className={`score-circle ${result.security_score > 70 ? 'high' : result.security_score > 40 ? 'medium' : 'low'}`}>
              {result.security_score}%
            </div>
            <p><strong>{strings.portScanner.securityScore}</strong></p>
          </div>

          <div className="grid-2">
            <div>
              <h4>{strings.portScanner.openPorts} ({result.open_ports.length})</h4>
              {result.open_ports.length > 0 ? (
                result.open_ports.map((port, idx) => (
                  <div key={idx} className={`port-item ${port.risk.toLowerCase()}-risk`}>
                    <div>
                      <strong>Port {port.port}</strong> - {port.service}
                      <br/>
                      <small>Risk: {port.risk}</small>
                    </div>
                    <span className="status-badge open">OPEN</span>
                  </div>
                ))
              ) : (
                <div className="alert alert-success">{strings.portScanner.noOpenPorts}</div>
              )}
            </div>

            <div>
              <h4>{strings.portScanner.recommendations}</h4>
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className={`recommendation ${rec.includes('❌') ? 'critical' : rec.includes('⚠') ? 'warning' : ''}`}>
                  {rec}
                </div>
              ))}
            </div>
          </div>

          <p className="text-muted mt-3">
            {strings.portScanner.scannedInfo
              .replace('{{total}}', result.total_ports_scanned)
              .replace('{{open}}', result.open_ports.length)
              .replace('{{closed}}', result.closed_ports_count)}
          </p>
        </div>
      )}
    </div>
  );
}

// Password Checker Component
export function PasswordChecker({ apiUrl, apiToken, onCheck, strings }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!password) {
      setValidationError(strings.passwordChecker.required);
      return;
    }

    if (password.length < 8) {
      setValidationError(strings.passwordChecker.minLength);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiToken) headers['X-API-Token'] = apiToken;

      const response = await fetch(`${apiUrl}/api/scan/password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        onCheck({
          type: 'password_check',
          strength: data.data.strength,
          score: data.data.score
        });
      } else {
        setError(data.error || strings.passwordChecker.error);
      }
    } catch (err) {
      setError(strings.common.connectionError + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>{strings.passwordChecker.title}</h2>

      <form onSubmit={handleCheck}>
        <div className="form-group">
          <label>{strings.passwordChecker.enterPassword}</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={strings.passwordChecker.passwordPlaceholder}
              disabled={loading}
              aria-label={strings.passwordChecker.enterPassword}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <small>{strings.passwordChecker.note}</small>
          {validationError && <small style={{ color: 'red' }}>{validationError}</small>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? strings.passwordChecker.checking : strings.passwordChecker.checkButton}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="result-section">
          <h3>{strings.passwordChecker.results}</h3>

          <div className="security-score">
            <div className={`score-circle ${result.color === 'green' ? 'high' : result.color === 'yellow' ? 'medium' : 'low'}`}>
              {result.score}/10
            </div>
            <p><strong>{result.strength}</strong></p>
          </div>

          <div className="grid-2">
            <div>
              <h4>📝 {strings.passwordChecker.passwordLength}</h4>
              <div className="list-item">
                <span className="list-item-icon">📏</span>
                <div>{result.password_length} {strings.passwordChecker.characters}</div>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(result.score / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <h4>⚠️ {strings.passwordChecker.feedback}</h4>
              {result.feedback.length > 0 ? (
                result.feedback.map((item, idx) => (
                  <div key={idx} className="recommendation critical">
                    ❌ {item}
                  </div>
                ))
              ) : (
                <div className="recommendation" style={{ background: '#e8f5e9', borderLeft: '4px solid #51cf66' }}>
                  {strings.passwordChecker.excellent}
                </div>
              )}
            </div>
          </div>

          <h4 style={{ marginTop: '2rem' }}>💡 {strings.passwordChecker.recommendations}</h4>
          {result.recommendations.map((rec, idx) => (
            <div key={idx} className="recommendation warning">
              💡 {rec}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// WiFi Security Checker Component
export function WiFiSecurityChecker({ apiUrl, apiToken, onCheck, strings }) {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};
    if (!ssid.trim()) newErrors.ssid = strings.common.required;
    if (!password.trim()) newErrors.password = strings.common.required;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    setError(null);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiToken) headers['X-API-Token'] = apiToken;

      const response = await fetch(`${apiUrl}/api/scan/wifi-security`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ssid, password })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        onCheck({
          type: 'wifi_check',
          ssid,
          security_score: data.data.security_score
        });
      } else {
        setError(data.error || strings.wifiSecurity.error);
      }
    } catch (err) {
      setError(strings.common.connectionError + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>{strings.wifiSecurity.title}</h2>

      <form onSubmit={handleCheck}>
        <div className="form-group">
          <label>{strings.wifiSecurity.ssidLabel}</label>
          <input
            type="text"
            value={ssid}
            onChange={(e) => setSsid(e.target.value)}
            placeholder={strings.wifiSecurity.ssidPlaceholder}
            disabled={loading}
            aria-label={strings.wifiSecurity.ssidLabel}
          />
          {errors.ssid && <small style={{ color: 'red' }}>{errors.ssid}</small>}
        </div>

        <div className="form-group">
          <label>{strings.wifiSecurity.passwordLabel}</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={strings.wifiSecurity.passwordPlaceholder}
              disabled={loading}
              aria-label={strings.wifiSecurity.passwordLabel}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && <small style={{ color: 'red' }}>{errors.password}</small>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? strings.wifiSecurity.checking : strings.wifiSecurity.checkButton}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="result-section">
          <h3>{strings.wifiSecurity.results}</h3>

          <div className="security-score">
            <div className={`score-circle ${result.security_score > 70 ? 'high' : result.security_score > 40 ? 'medium' : 'low'}`}>
              {result.security_score}%
            </div>
            <p><strong>{strings.wifiSecurity.passwordLabel}</strong></p>
          </div>

          <div className="grid-2">
            <div>
              <h4>📡 {strings.wifiSecurity.wifiInfo}</h4>
              <div className="list-item">
                <span className="list-item-icon">📶</span>
                <div>
                  <strong>{strings.wifiSecurity.ssid}:</strong> {result.ssid}
                </div>
              </div>
              <div className="list-item">
                <span className="list-item-icon">🔒</span>
                <div>
                  <strong>{strings.wifiSecurity.passwordStrength}:</strong> {result.password_strength}
                </div>
              </div>
            </div>

            <div>
              <h4>⚠️ {strings.wifiSecurity.issuesFound}</h4>
              {result.issues.map((issue, idx) => (
                <div key={idx} className="recommendation critical">
                  ⚠️ {issue}
                </div>
              ))}
            </div>
          </div>

          <h4 style={{ marginTop: '2rem' }}>💡 {strings.wifiSecurity.recommendations}</h4>
          {result.recommendations.map((rec, idx) => (
            <div key={idx} className="recommendation warning">
              💡 {rec}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Network Info Component
export function NetworkInfo({ apiUrl, apiToken, strings }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNetworkInfo();
  }, []);

  const fetchNetworkInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = {};
      if (apiToken) headers['X-API-Token'] = apiToken;

      const response = await fetch(`${apiUrl}/api/scan/network-info`, { headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data.success) {
        setInfo(data.data);
      } else {
        setError(data.error || strings.networkInfo.error);
      }
    } catch (err) {
      setError(strings.common.connectionError + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="card spinner"></div>;
  if (error) return <div className="card alert alert-error">{error}</div>;
  if (!info) return <div className="card">{strings.networkInfo.noData}</div>;

  return (
    <div className="card">
      <h2>{strings.networkInfo.title}</h2>

      {info.system && (
        <div className="result-section">
          <h3>💻 {strings.networkInfo.systemInfo}</h3>
          <div className="list-item">
            <span>📱 {strings.networkInfo.platform}:</span> <strong>{info.system.platform}</strong>
          </div>
          <div className="list-item">
            <span>🖥️ {strings.networkInfo.hostname}:</span> <strong>{info.system.hostname}</strong>
          </div>
          <div className="list-item">
            <span>⚡ {strings.networkInfo.cpu}:</span> <strong>{info.system.cpu_percent.toFixed(1)}%</strong>
          </div>
          <div className="list-item">
            <span>🧠 {strings.networkInfo.memory}:</span> <strong>{info.system.memory_percent.toFixed(1)}%</strong>
          </div>
          <div className="list-item">
            <span>💾 {strings.networkInfo.disk}:</span> <strong>{info.system.disk_usage.toFixed(1)}%</strong>
          </div>
        </div>
      )}

      {info.interfaces && (
        <div className="result-section">
          <h3>🌐 {strings.networkInfo.networkInterfaces}</h3>
          {Object.entries(info.interfaces).map(([name, addrs]) => (
            <div key={name} className="list-item">
              <div>
                <strong>{name}</strong>
                {addrs.map((addr, idx) => (
                  <div key={idx} style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    {addr.family}: <code>{addr.address}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={fetchNetworkInfo} className="btn btn-secondary mt-3">
        {strings.networkInfo.refresh}
      </button>
    </div>
  );
}

// Scan History Component
export function ScanHistory({ history, strings }) {
  const [filter, setFilter] = useState('all');

  const filtered = history.filter(h =>
    filter === 'all' || h.type === filter
  );

  return (
    <div className="card">
      <h2>{strings.history.title}</h2>

      <div className="form-group">
        <label>{strings.history.filter}</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">{strings.history.all}</option>
          <option value="port_scan">{strings.history.portScan}</option>
          <option value="password_check">{strings.history.passwordCheck}</option>
          <option value="wifi_check">{strings.history.wifiCheck}</option>
          <option value="quick_audit">{strings.history.quickAudit}</option>
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>{strings.history.time}</th>
                <th>{strings.history.type}</th>
                <th>{strings.history.details}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.timestamp}</td>
                  <td>
                    {item.type === 'port_scan' && '🔍'}
                    {item.type === 'password_check' && '🔐'}
                    {item.type === 'wifi_check' && '📡'}
                    {item.type === 'quick_audit' && '🚀'}
                    {' '}{item.type}
                  </td>
                  <td>
                    {item.type === 'port_scan' && `${item.open_ports_count} ${strings.history.open} - ${strings.history.score}: ${item.security_score}%`}
                    {item.type === 'password_check' && `${item.strength} - ${strings.history.score}: ${item.score}/10`}
                    {item.type === 'wifi_check' && `${item.ssid} - ${strings.history.score}: ${item.security_score}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted text-center mt-3">{strings.history.empty}</p>
      )}
    </div>
  );
}

// Dashboard Component
export function Dashboard({ apiUrl, apiToken, strings }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const headers = {};
      if (apiToken) headers['X-API-Token'] = apiToken;

      const response = await fetch(`${apiUrl}/api/recommendations`, { headers });
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>{strings.dashboard.title}</h2>
        <p>{strings.dashboard.subtitle}</p>
      </div>

      <div className="card">
        <h3>{strings.dashboard.startAudit}</h3>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="dashboard-card-icon">🔍</div>
            <div className="dashboard-card-title">{strings.dashboard.portScanner}</div>
            <div className="dashboard-card-desc">{strings.dashboard.portScannerDesc}</div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon">🔐</div>
            <div className="dashboard-card-title">{strings.dashboard.passwordChecker}</div>
            <div className="dashboard-card-desc">{strings.dashboard.passwordCheckerDesc}</div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon">📡</div>
            <div className="dashboard-card-title">{strings.dashboard.wifiSecurity}</div>
            <div className="dashboard-card-desc">{strings.dashboard.wifiSecurityDesc}</div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon">ℹ️</div>
            <div className="dashboard-card-title">{strings.dashboard.networkInfo}</div>
            <div className="dashboard-card-desc">{strings.dashboard.networkInfoDesc}</div>
          </div>
        </div>
      </div>

      {recommendations && (
        <div className="card">
          <h3>💡 {strings.dashboard.securityRecommendations}</h3>

          <div className="grid-2">
            <div>
              <h4>🌐 {strings.dashboard.network}</h4>
              {recommendations.network.map((rec, idx) => (
                <div key={idx} className="recommendation warning">
                  💡 {rec}
                </div>
              ))}
            </div>

            <div>
              <h4>🔓 {strings.dashboard.ports}</h4>
              {recommendations.ports.map((rec, idx) => (
                <div key={idx} className="recommendation warning">
                  💡 {rec}
                </div>
              ))}
            </div>

            <div>
              <h4>🔐 {strings.dashboard.passwords}</h4>
              {recommendations.passwords.map((rec, idx) => (
                <div key={idx} className="recommendation warning">
                  💡 {rec}
                </div>
              ))}
            </div>

            <div>
              <h4>🖥️ {strings.dashboard.devices}</h4>
              {recommendations.devices.map((rec, idx) => (
                <div key={idx} className="recommendation warning">
                  💡 {rec}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default {
  PortScanner,
  PasswordChecker,
  WiFiSecurityChecker,
  NetworkInfo,
  ScanHistory,
  Dashboard
};
