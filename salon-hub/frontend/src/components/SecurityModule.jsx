import React, { useState } from 'react';

// i18n translations
const translations = {
  en: {
    title: '🔒 Network Security Audit',
    wifiTab: '📡 WiFi Security',
    passwordTab: '🔐 Password Strength',
    wifiTitle: '📡 WiFi Security Check',
    passwordTitle: '🔐 Password Strength Check',
    ssidLabel: 'Network Name (SSID)',
    ssidPlaceholder: 'Enter your WiFi network name',
    passwordLabel: 'Password to Test',
    passwordPlaceholder: 'Enter a password to check',
    wifiPasswordLabel: 'WiFi Password',
    wifiPasswordPlaceholder: 'Enter your WiFi password',
    checkWifiBtn: '🔍 Check WiFi Security',
    checkPasswordBtn: '🔍 Check Password Strength',
    checking: 'Checking...',
    results: '📊 Results',
    networkStatus: 'Network Status',
    secure: '✅ Secure',
    needsImprovement: '⚠️ Needs Improvement',
    issuesFound: 'Issues Found:',
    recommendations: 'Recommendations:',
    strengthScore: 'Strength Score:',
    length: 'Length:',
    characters: 'characters',
    howToImprove: 'How to Improve:',
    securityTips: '💡 Security Tips',
    fillAllFields: 'Please fill in all fields',
    enterPassword: 'Please enter a password',
    connectionError: 'Connection error. Please try again.',
    checkFailed: 'check failed'
  },
  vi: {
    title: '🔒 Kiểm Tra Bảo Mật Mạng',
    wifiTab: '📡 Bảo Mật WiFi',
    passwordTab: '🔐 Độ Mạnh Mật Khẩu',
    wifiTitle: '📡 Kiểm Tra Bảo Mật WiFi',
    passwordTitle: '🔐 Kiểm Tra Độ Mạnh Mật Khẩu',
    ssidLabel: 'Tên Mạng (SSID)',
    ssidPlaceholder: 'Nhập tên mạng WiFi của bạn',
    passwordLabel: 'Mật Khẩu Cần Kiểm Tra',
    passwordPlaceholder: 'Nhập mật khẩu để kiểm tra',
    wifiPasswordLabel: 'Mật Khẩu WiFi',
    wifiPasswordPlaceholder: 'Nhập mật khẩu WiFi của bạn',
    checkWifiBtn: '🔍 Kiểm Tra Bảo Mật WiFi',
    checkPasswordBtn: '🔍 Kiểm Tra Độ Mạnh Mật Khẩu',
    checking: 'Đang kiểm tra...',
    results: '📊 Kết Quả',
    networkStatus: 'Trạng Thái Mạng',
    secure: '✅ An Toàn',
    needsImprovement: '⚠️ Cần Cải Thiện',
    issuesFound: 'Vấn Đề Tìm Thấy:',
    recommendations: 'Khuyến Nghị:',
    strengthScore: 'Điểm Mạnh:',
    length: 'Độ Dài:',
    characters: 'ký tự',
    howToImprove: 'Cách Cải Thiện:',
    securityTips: '💡 Mẹo Bảo Mật',
    fillAllFields: 'Vui lòng điền tất cả các trường',
    enterPassword: 'Vui lòng nhập mật khẩu',
    connectionError: 'Lỗi kết nối. Vui lòng thử lại.',
    checkFailed: 'kiểm tra thất bại'
  }
};

function SecurityModule({ apiToken, apiUrl }) {
  const [language, setLanguage] = useState('en');
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

  const t = translations[language];

  const handleKeyDown = (e) => {
    if (activeTab === 'wifi') {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveTab('password');
      }
    } else if (activeTab === 'password') {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveTab('wifi');
      }
    }
  };

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
      setError(t.fillAllFields);
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
          severity: data.data.severity || 'Fair',
          riskScore: typeof data.data.risk_score === 'number' ? data.data.risk_score : 0,
          issues: Array.isArray(data.data.issues) ? data.data.issues : [],
          recommendations: Array.isArray(data.data.recommendations) ? data.data.recommendations : [],
          type: 'wifi'
        });
      } else {
        setError(data.message || `WiFi ${t.checkFailed}`);
      }
    } catch (err) {
      setError(t.connectionError);
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
      setError(t.enterPassword);
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
        setError(data.message || `Password ${t.checkFailed}`);
      }
    } catch (err) {
      setError(t.connectionError);
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

  return (
    <div className="security-module">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{t.title}</h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
            aria-label="Language selection"
          >
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
          </select>
        </div>

        <div
          role="tablist"
          style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}
          onKeyDown={handleKeyDown}
        >
          <button
            role="tab"
            aria-selected={activeTab === 'wifi'}
            aria-controls="wifi-panel"
            id="wifi-tab"
            className="btn"
            style={{
              backgroundColor: activeTab === 'wifi' ? '#ec4899' : '#e5e7eb',
              color: activeTab === 'wifi' ? 'white' : '#1f2937',
              cursor: 'pointer',
              fontWeight: activeTab === 'wifi' ? 'bold' : 'normal'
            }}
            onClick={() => setActiveTab('wifi')}
          >
            {t.wifiTab}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'password'}
            aria-controls="password-panel"
            id="password-tab"
            className="btn"
            style={{
              backgroundColor: activeTab === 'password' ? '#ec4899' : '#e5e7eb',
              color: activeTab === 'password' ? 'white' : '#1f2937',
              cursor: 'pointer',
              fontWeight: activeTab === 'password' ? 'bold' : 'normal'
            }}
            onClick={() => setActiveTab('password')}
          >
            {t.passwordTab}
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {activeTab === 'wifi' && (
          <div role="tabpanel" id="wifi-panel" aria-labelledby="wifi-tab">
            <h3 style={{ marginBottom: '1rem' }}>{t.wifiTitle}</h3>
            <div className="form-group">
              <label htmlFor="ssid">{t.ssidLabel}</label>
              <input
                id="ssid"
                type="text"
                name="ssid"
                value={wifiData.ssid}
                onChange={handleWifiChange}
                placeholder={t.ssidPlaceholder}
                maxLength="32"
                aria-label={t.ssidLabel}
              />
            </div>
            <div className="form-group">
              <label htmlFor="wifiPassword">{t.wifiPasswordLabel}</label>
              <input
                id="wifiPassword"
                type="password"
                name="password"
                value={wifiData.password}
                onChange={handleWifiChange}
                placeholder={t.wifiPasswordPlaceholder}
                maxLength="128"
                aria-label={t.wifiPasswordLabel}
              />
              <small style={{ display: 'block', marginTop: '0.5rem', color: '#6b7280' }}>
                💡 Your WiFi password stays private - it's only checked locally in your browser
              </small>
            </div>
            <button
              className="btn btn-primary"
              onClick={checkWifiSecurity}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? t.checking : t.checkWifiBtn}
            </button>
          </div>
        )}

        {activeTab === 'password' && (
          <div role="tabpanel" id="password-panel" aria-labelledby="password-tab">
            <h3 style={{ marginBottom: '1rem' }}>{t.passwordTitle}</h3>
            <div className="form-group">
              <label htmlFor="password">{t.passwordLabel}</label>
              <input
                id="password"
                type="password"
                name="password"
                value={passwordData.password}
                onChange={handlePasswordChange}
                placeholder={t.passwordPlaceholder}
                maxLength="128"
                aria-label={t.passwordLabel}
              />
              <small style={{ display: 'block', marginTop: '0.5rem', color: '#6b7280' }}>
                💡 Your password stays private - it's only checked locally in your browser
              </small>
            </div>
            <button
              className="btn btn-primary"
              onClick={checkPasswordStrength}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? t.checking : t.checkPasswordBtn}
            </button>
          </div>
        )}

        {results && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: results.type === 'wifi' && !results.secure ? '#fff8f8' : '#f9fafb',
            borderRadius: '8px',
            border: results.type === 'wifi' && !results.secure ? '2px solid #ef4444' : '1px solid #e5e7eb'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>{t.results}</h3>

            {results.type === 'wifi' && (
              <div>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{t.networkStatus}</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: results.secure ? '#10b981' : '#ef4444' }}>
                      {results.secure ? t.secure : t.needsImprovement}
                    </p>
                    {results.severity && (
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        Status: <strong>{results.severity}</strong>
                      </p>
                    )}
                    {results.riskScore !== undefined && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Risk Level:</span>
                        <div style={{
                          width: '100px',
                          height: '6px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(results.riskScore / 10) * 100}%`,
                            height: '100%',
                            backgroundColor: results.riskScore > 7 ? '#ef4444' : results.riskScore > 4 ? '#f59e0b' : '#10b981',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{results.riskScore}/10</span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '2rem' }}>
                    {results.secure ? '✅' : '⚠️'}
                  </div>
                </div>

                {results.issues && results.issues.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.5rem', color: '#ef4444' }}>{t.issuesFound}</h4>
                    <ul style={{ listStyle: 'none', color: '#6b7280' }}>
                      {results.issues.map((issue, idx) => (
                        <li key={idx} style={{ padding: '0.25rem 0' }}>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.recommendations && (
                  <div>
                    <h4 style={{ marginBottom: '0.5rem', color: '#10b981' }}>{t.recommendations}</h4>
                    <ul style={{ listStyle: 'none', color: '#6b7280' }}>
                      {results.recommendations.map((rec, idx) => (
                        <li key={idx} style={{ padding: '0.25rem 0' }}>
                          {rec}
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
                    {t.strengthScore} {results.score}/5
                  </p>
                  <div style={{
                    backgroundColor: '#e5e7eb',
                    borderRadius: '8px',
                    height: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      width: `${(results.score / 5) * 100}%`,
                      height: '100%',
                      backgroundColor: getStrengthColor(results.score),
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>

                <div style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: results.score <= 1 ? '#fef2f2' : 'white',
                  borderRadius: '6px',
                  border: `2px solid ${getStrengthColor(results.score)}`
                }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: getStrengthColor(results.score) }}>
                    {results.strength}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {t.length} {results.length} {t.characters}
                  </p>
                  {results.score <= 1 && (
                    <p style={{ fontSize: '0.875rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: 'bold' }}>
                      ⚠️ This password is too weak and should not be used!
                    </p>
                  )}
                </div>

                {results.feedback && results.feedback.length > 0 && (
                  <div>
                    <h4 style={{ marginBottom: '0.5rem', color: results.score <= 1 ? '#ef4444' : '#f59e0b' }}>
                      {t.howToImprove}
                    </h4>
                    <ul style={{ listStyle: 'none', color: '#6b7280' }}>
                      {results.feedback.map((tip, idx) => (
                        <li key={idx} style={{ padding: '0.5rem 0' }}>
                          {tip}
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
          <h4 style={{ marginBottom: '0.5rem', color: '#0c4a6e' }}>{t.securityTips}</h4>
          <ul style={{ fontSize: '0.875rem', color: '#0c4a6e', listStyle: 'none' }}>
            {language === 'en' ? (
              <>
                <li>✓ Use passwords with at least 12 characters</li>
                <li>✓ Include uppercase, lowercase, numbers, and symbols</li>
                <li>✓ Change WiFi password every 90 days</li>
                <li>✓ Disable WPS (WiFi Protected Setup)</li>
                <li>✓ Keep router firmware updated</li>
                <li>✓ Your password/WiFi data never leaves your browser</li>
              </>
            ) : (
              <>
                <li>✓ Sử dụng mật khẩu ít nhất 12 ký tự</li>
                <li>✓ Bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                <li>✓ Thay đổi mật khẩu WiFi mỗi 90 ngày</li>
                <li>✓ Tắt WPS (WiFi Protected Setup)</li>
                <li>✓ Cập nhật firmware router thường xuyên</li>
                <li>✓ Dữ liệu mật khẩu/WiFi của bạn không rời khỏi trình duyệt</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SecurityModule;
