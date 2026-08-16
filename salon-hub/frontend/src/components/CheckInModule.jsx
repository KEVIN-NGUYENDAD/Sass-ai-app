import React, { useState, useEffect } from 'react';

function CheckInModule({ apiToken, apiUrl }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service_note: '',
    nickname: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSlots();
  }, [selectedDate]);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/slots?date=${selectedDate}`);
      const data = await response.json();
      setSlots(data.slots || []);
    } catch (err) {
      setError('Failed to load time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    if (!formData.name || !formData.phone || !formData.service_note) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          date: selectedDate,
          time: selectedSlot
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', phone: '', service_note: '', nickname: '' });
        setSelectedSlot(null);
        setTimeout(() => setSubmitted(false), 5000);
        loadSlots();
      } else {
        const data = await response.json();
        setError(data.error || 'Check-in failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const max = new Date();
    max.setDate(max.getDate() + 6);
    return max.toISOString().split('T')[0];
  };

  return (
    <div className="checkin-module">
      <div className="card">
        <div className="card-header">
          <h2>✂️ Customer Check-In</h2>
        </div>

        {submitted && (
          <div className="alert alert-success">
            ✅ Check-in successful! You will receive an SMS confirmation soon.
          </div>
        )}

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <form onSubmit={handleCheckIn}>
          <div className="grid">
            <div>
              <div className="form-group">
                <label>📅 Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                />
              </div>
            </div>

            <div>
              <div className="form-group">
                <label>⏰ Select Time</label>
                {loading ? (
                  <div style={{ color: '#6b7280' }}>Loading slots...</div>
                ) : slots.length > 0 ? (
                  <select
                    value={selectedSlot || ''}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                  >
                    <option value="">Choose a time...</option>
                    {slots.map(slot => (
                      <option
                        key={slot.time}
                        value={slot.time}
                        disabled={slot.available === 0}
                      >
                        {slot.time} ({slot.available} available)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ color: '#6b7280' }}>No slots available</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">👤 Full Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">📞 Phone Number *</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="service_note">💅 Service Needed *</label>
            <select
              id="service_note"
              name="service_note"
              value={formData.service_note}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a service...</option>
              <option value="Manicure">Manicure</option>
              <option value="Pedicure">Pedicure</option>
              <option value="Full Set">Full Set</option>
              <option value="Nail Art">Nail Art</option>
              <option value="Gel Polish">Gel Polish</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nickname">🏷️ Nickname (optional)</label>
            <input
              id="nickname"
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              placeholder="Nickname or special notes"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Checking in...' : '✂️ Check In Now'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>ℹ️ Information</h3>
          <ul style={{ fontSize: '0.875rem', color: '#6b7280', listStyle: 'none' }}>
            <li>✓ Booking available up to 7 days in advance</li>
            <li>✓ You'll receive SMS confirmation</li>
            <li>✓ Arrive 5 minutes before your appointment</li>
            <li>✓ Cancellations must be made 24 hours ahead</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CheckInModule;
