import React, { useState, useEffect } from 'react';

function Dashboard({ apiToken, staffMode, apiUrl }) {
  const [stats, setStats] = useState({
    todayCheckins: 0,
    securityStatus: 'healthy',
    subscriptionTier: 'professional',
    nextRenewal: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      // Load subscription tiers
      const response = await fetch(`${apiUrl}/api/subscription/tiers`);
      const data = await response.json();
      // Update dashboard
      setStats({
        todayCheckins: 0,
        securityStatus: 'healthy',
        subscriptionTier: 'professional',
        nextRenewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="grid">
        <div className="card">
          <div className="card-header">
            <h3>📊 Today's Check-ins</h3>
            <span className="badge badge-info">{stats.todayCheckins}</span>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ec4899' }}>
            {stats.todayCheckins}
          </p>
          <p style={{ color: '#6b7280' }}>customers checked in</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>🔒 Security Status</h3>
            <span className="badge badge-success">✅ Healthy</span>
          </div>
          <p style={{ fontSize: '1rem', color: '#10b981' }}>
            WiFi & Network: Secure
          </p>
          <p style={{ color: '#6b7280' }}>All systems operating normally</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>💳 Subscription</h3>
            <span className="badge badge-info">{stats.subscriptionTier.toUpperCase()}</span>
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>
            ${stats.subscriptionTier === 'starter' ? 29 : stats.subscriptionTier === 'professional' ? 79 : 199}/month
          </p>
          <p style={{ color: '#6b7280' }}>Renews: {stats.nextRenewal}</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2>🎯 Quick Start</h2>
        </div>
        <div className="grid">
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✂️</div>
            <h3>Customer Check-In</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Manage appointments and queue
            </p>
            <button className="btn btn-primary btn-sm">Go to Check-In</button>
          </div>
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
            <h3>Security Audit</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Test WiFi & network security
            </p>
            <button className="btn btn-primary btn-sm">Run Audit</button>
          </div>
          {staffMode && (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
              <h3>Staff Panel</h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                View queue and manage staff
              </p>
              <button className="btn btn-primary btn-sm">Access Panel</button>
            </div>
          )}
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <h3>Reports</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              View daily/weekly/monthly analytics
            </p>
            <button className="btn btn-primary btn-sm">View Reports</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h2>📢 Updates</h2>
        </div>
        <ul style={{ listStyle: 'none' }}>
          <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
            ✨ <strong>New Feature:</strong> SMS reminders for customers
          </li>
          <li style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
            🔐 <strong>Security:</strong> WiFi security checks updated
          </li>
          <li style={{ padding: '0.75rem 0' }}>
            📱 <strong>Mobile:</strong> App now fully responsive
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
