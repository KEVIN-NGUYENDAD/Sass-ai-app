import React, { useState, useEffect } from 'react';

// Port Scanner Component
export function PortScanner({ apiUrl, onScan }) {
  const [target, setTarget] = useState('localhost');
  const [ports, setPorts] = useState('1-1000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${apiUrl}/api/scan/ports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, ports })
      });

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
        setError(data.error || 'Scan failed');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>🔍 Quét Cổng (Port Scanner)</h2>

      <form onSubmit={handleScan}>
        <div className="form-group">
          <label>Target Host/IP</label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="localhost, 192.168.1.1, example.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Dải Cổng (Port Range)</label>
          <input
            type="text"
            value={ports}
            onChange={(e) => setPorts(e.target.value)}
            placeholder="1-1000 hoặc 21,22,80,443"
            required
          />
          <small>Ví dụ: 1-1000 hoặc 21,22,80,443,3306,5432</small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '⏳ Đang quét...' : '🔍 Bắt đầu Quét'}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="result-section">
          <h3>📊 Kết Quả Quét</h3>

          <div className="security-score">
            <div className={`score-circle ${result.security_score > 70 ? 'high' : result.security_score > 40 ? 'medium' : 'low'}`}>
              {result.security_score}%
            </div>
            <p><strong>An Ninh Điểm</strong></p>
          </div>

          <div className="grid-2">
            <div>
              <h4>✅ Cổng Mở ({result.open_ports.length})</h4>
              {result.open_ports.map((port, idx) => (
                <div key={idx} className={`port-item ${port.risk.toLowerCase()}-risk`}>
                  <div>
                    <strong>Port {port.port}</strong> - {port.service}
                    <br/>
                    <small>Risk: {port.risk}</small>
                  </div>
                  <span className="status-badge open">OPEN</span>
                </div>
              ))}
            </div>

            <div>
              <h4>💡 Đề Xuất</h4>
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className={`recommendation ${rec.includes('❌') ? 'critical' : rec.includes('⚠') ? 'warning' : ''}`}>
                  {rec}
                </div>
              ))}
            </div>
          </div>

          <p className="text-muted mt-3">
            Quét {result.total_ports_scanned} cổng - {result.open_ports.length} mở, {result.closed_ports_count} đóng
          </p>
        </div>
      )}
    </div>
  );
}

// Password Checker Component
export function PasswordChecker({ apiUrl, onCheck }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/scan/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        setError(data.error || 'Check failed');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>🔐 Kiểm Tra Độ Mạnh Mật Khẩu</h2>

      <form onSubmit={handleCheck}>
        <div className="form-group">
          <label>Nhập Mật Khẩu Để Kiểm Tra</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              required
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
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <small>Mật khẩu chỉ được kiểm tra cục bộ, không được gửi lên server</small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '⏳ Đang kiểm tra...' : '🔍 Kiểm Tra'}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="result-section">
          <h3>📊 Kết Quả Kiểm Tra</h3>

          <div className="security-score">
            <div className={`score-circle ${result.color === 'green' ? 'high' : result.color === 'yellow' ? 'medium' : 'low'}`}>
              {result.score}/10
            </div>
            <p><strong>{result.strength}</strong></p>
          </div>

          <div className="grid-2">
            <div>
              <h4>📝 Thông Tin</h4>
              <div className="list-item">
                <span className="list-item-icon">📏</span>
                <div>Độ dài: <strong>{result.password_length}</strong> ký tự</div>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(result.score / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <h4>⚠️ Nhận Xét</h4>
              {result.feedback.length > 0 ? (
                result.feedback.map((item, idx) => (
                  <div key={idx} className="recommendation critical">
                    ❌ {item}
                  </div>
                ))
              ) : (
                <div className="recommendation" style={{ background: '#e8f5e9', borderLeft: '4px solid #51cf66' }}>
                  ✓ Tuyệt vời! Mật khẩu rất mạnh
                </div>
              )}
            </div>
          </div>

          <h4 style={{ marginTop: '2rem' }}>💡 Đề Xuất</h4>
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
export function WiFiSecurityChecker({ apiUrl, onCheck }) {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/scan/wifi-security`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        setError(data.error || 'Check failed');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>📡 Kiểm Tra An Ninh WiFi</h2>

      <form onSubmit={handleCheck}>
        <div className="form-group">
          <label>Tên WiFi (SSID)</label>
          <input
            type="text"
            value={ssid}
            onChange={(e) => setSsid(e.target.value)}
            placeholder="Nhập tên WiFi..."
            required
          />
        </div>

        <div className="form-group">
          <label>Mật Khẩu WiFi</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu WiFi..."
              required
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
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '⏳ Đang kiểm tra...' : '🔍 Kiểm Tra WiFi'}
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className="result-section">
          <h3>📊 Kết Quả Kiểm Tra WiFi</h3>

          <div className="security-score">
            <div className={`score-circle ${result.security_score > 70 ? 'high' : result.security_score > 40 ? 'medium' : 'low'}`}>
              {result.security_score}%
            </div>
            <p><strong>Điểm An Ninh</strong></p>
          </div>

          <div className="grid-2">
            <div>
              <h4>📡 Thông Tin WiFi</h4>
              <div className="list-item">
                <span className="list-item-icon">📶</span>
                <div>
                  <strong>SSID:</strong> {result.ssid}
                </div>
              </div>
              <div className="list-item">
                <span className="list-item-icon">🔒</span>
                <div>
                  <strong>Mật Khẩu:</strong> {result.password_strength}
                </div>
              </div>
            </div>

            <div>
              <h4>⚠️ Vấn Đề Phát Hiện</h4>
              {result.issues.map((issue, idx) => (
                <div key={idx} className="recommendation critical">
                  ⚠️ {issue}
                </div>
              ))}
            </div>
          </div>

          <h4 style={{ marginTop: '2rem' }}>💡 Đề Xuất Cải Thiện</h4>
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
export function NetworkInfo({ apiUrl }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNetworkInfo();
  }, []);

  const fetchNetworkInfo = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/scan/network-info`);
      const data = await response.json();

      if (data.success) {
        setInfo(data.data);
      } else {
        setError(data.error || 'Failed to fetch network info');
      }
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="card spinner"></div>;
  if (error) return <div className="card alert alert-error">{error}</div>;
  if (!info) return <div className="card">Không có dữ liệu</div>;

  return (
    <div className="card">
      <h2>ℹ️ Thông Tin Mạng</h2>

      {info.system && (
        <div className="result-section">
          <h3>💻 Thông Tin Hệ Thống</h3>
          <div className="list-item">
            <span>📱 Platform:</span> <strong>{info.system.platform}</strong>
          </div>
          <div className="list-item">
            <span>🖥️ Hostname:</span> <strong>{info.system.hostname}</strong>
          </div>
          <div className="list-item">
            <span>⚡ CPU:</span> <strong>{info.system.cpu_percent.toFixed(1)}%</strong>
          </div>
          <div className="list-item">
            <span>🧠 Memory:</span> <strong>{info.system.memory_percent.toFixed(1)}%</strong>
          </div>
          <div className="list-item">
            <span>💾 Disk:</span> <strong>{info.system.disk_usage.toFixed(1)}%</strong>
          </div>
        </div>
      )}

      {info.interfaces && (
        <div className="result-section">
          <h3>🌐 Network Interfaces</h3>
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
        🔄 Làm Mới
      </button>
    </div>
  );
}

// Scan History Component
export function ScanHistory({ history }) {
  const [filter, setFilter] = useState('all');

  const filtered = history.filter(h =>
    filter === 'all' || h.type === filter
  );

  return (
    <div className="card">
      <h2>📜 Lịch Sử Quét</h2>

      <div className="form-group">
        <label>Lọc theo loại</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Tất Cả</option>
          <option value="port_scan">Quét Cổng</option>
          <option value="password_check">Kiểm Tra Mật Khẩu</option>
          <option value="wifi_check">Kiểm Tra WiFi</option>
          <option value="quick_audit">Quick Audit</option>
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>Thời Gian</th>
                <th>Loại</th>
                <th>Chi Tiết</th>
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
                    {item.type === 'port_scan' && `${item.open_ports_count} cổng mở - Điểm: ${item.security_score}%`}
                    {item.type === 'password_check' && `${item.strength} - Điểm: ${item.score}/10`}
                    {item.type === 'wifi_check' && `${item.ssid} - Điểm: ${item.security_score}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted text-center mt-3">Chưa có lịch sử quét</p>
      )}
    </div>
  );
}

// Dashboard Component
export function Dashboard({ apiUrl }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/recommendations`);
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
        <h2>📊 Bảng Điều Khiển An Ninh Mạng</h2>
        <p>Quản lý và giám sát an ninh mạng cho gia đình của bạn</p>
      </div>

      <div className="card">
        <h3>🚀 Bắt Đầu Kiểm Toán</h3>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="dashboard-card-icon">🔍</div>
            <div className="dashboard-card-title">Quét Cổng</div>
            <div className="dashboard-card-desc">Tìm các cổng mở trên thiết bị</div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon">🔐</div>
            <div className="dashboard-card-title">Kiểm Tra Mật Khẩu</div>
            <div className="dashboard-card-desc">Đánh giá độ mạnh mật khẩu</div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon">📡</div>
            <div className="dashboard-card-title">WiFi Security</div>
            <div className="dashboard-card-desc">Kiểm tra an ninh mạng WiFi</div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon">ℹ️</div>
            <div className="dashboard-card-title">Network Info</div>
            <div className="dashboard-card-desc">Xem thông tin mạng chi tiết</div>
          </div>
        </div>
      </div>

      {recommendations && (
        <div className="card">
          <h3>💡 Đề Xuất An Ninh</h3>

          <div className="grid-2">
            <div>
              <h4>🌐 Mạng</h4>
              {recommendations.network.map((rec, idx) => (
                <div key={idx} className="recommendation warning">
                  💡 {rec}
                </div>
              ))}
            </div>

            <div>
              <h4>🔓 Cổng</h4>
              {recommendations.ports.map((rec, idx) => (
                <div key={idx} className="recommendation warning">
                  💡 {rec}
                </div>
              ))}
            </div>

            <div>
              <h4>🔐 Mật Khẩu</h4>
              {recommendations.passwords.map((rec, idx) => (
                <div key={idx} className="recommendation warning">
                  💡 {rec}
                </div>
              ))}
            </div>

            <div>
              <h4>🖥️ Thiết Bị</h4>
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
