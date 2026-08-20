(function () {
    const dateInput = document.getElementById('staffDate');
    const refreshBtn = document.getElementById('refreshBtn');
    const queueBody = document.getElementById('queueBody');
    const addDateInput = document.getElementById('addDate');
    const addTimeSelect = document.getElementById('addTime');
    const addDurationSelect = document.getElementById('addDuration');
    const addNameInput = document.getElementById('addName');
    const addPhoneInput = document.getElementById('addPhone');
    const addServiceInput = document.getElementById('addService');
    const addCheckinBtn = document.getElementById('addCheckinBtn');
    const addErrorEl = document.getElementById('addError');
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalName = document.getElementById('confirmModalName');
    const confirmModalTime = document.getElementById('confirmModalTime');
    const confirm30Btn = document.getElementById('confirm30Btn');
    const confirm45Btn = document.getElementById('confirm45Btn');
    const confirm60Btn = document.getElementById('confirm60Btn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');

    let timeSlots = [];
    let pendingConfirmCheckinId = null;

    function todayStr() {
        const d = new Date();
        const offset = d.getTimezoneOffset();
        return new Date(d.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
    }

    function formatTime(t) {
        const [h, m] = t.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
    }

    const STATUS_LABELS = {
        waiting_confirm: 'Waiting Confirm',
        confirmed: 'Confirmed',
        in_service: 'In Service',
        complete: 'Complete',
        cancelled: 'Cancelled',
    };

    async function loadQueue(options) {
        const isFirstLoad = !(options && options.silent);
        if (isFirstLoad) {
            queueBody.innerHTML = '<tr><td colspan="7" class="muted">Loading&hellip;</td></tr>';
        }
        try {
            const res = await fetch(`/api/checkins?date=${encodeURIComponent(dateInput.value)}`);
            const data = await res.json();
            renderQueue(data.checkins || []);
            updateStats(data.checkins || []);
        } catch (e) {
            if (isFirstLoad) queueBody.innerHTML = '<tr><td colspan="7" class="muted">Connection error.</td></tr>';
        }
    }

    function updateStats(checkins) {
        const waiting = checkins.filter(c => c.status === 'waiting').length;
        const inService = checkins.filter(c => c.status === 'in_service').length;
        const done = checkins.filter(c => c.status === 'done').length;
        document.getElementById('statWaiting').textContent = waiting;
        document.getElementById('statInService').textContent = inService;
        document.getElementById('statDone').textContent = done;
    }

    function renderQueue(checkins) {
        if (!checkins.length) {
            queueBody.innerHTML = '<tr><td colspan="7" class="muted">No check-ins for this date yet.</td></tr>';
            return;
        }
        queueBody.innerHTML = '';
        checkins.forEach((c) => {
            const tr = document.createElement('tr');
            const durationLabel = c.duration_minutes
                ? `${c.duration_minutes} min`
                : '<span class="muted">Pending owner confirm</span>';
            tr.innerHTML = `
                <td>${formatTime(c.time)}</td>
                <td>${escapeHtml(c.name)}</td>
                <td>${escapeHtml(c.phone || '—')}</td>
                <td>${escapeHtml(c.service_note)}</td>
                <td>${durationLabel}</td>
                <td><span class="status-badge status-${c.status}">${STATUS_LABELS[c.status] || c.status}</span></td>
                <td></td>
            `;
            const actionCell = tr.lastElementChild;
            if (c.status === 'waiting_confirm') {
                const confirmBtn = document.createElement('button');
                confirmBtn.className = 'btn-secondary';
                confirmBtn.style.cssText = 'width: 100%; padding: 6px 8px; font-size: 12px;';
                confirmBtn.textContent = 'Confirm';
                confirmBtn.addEventListener('click', () => showConfirmModal(c));
                actionCell.appendChild(confirmBtn);
            } else {
                const select = document.createElement('select');
                select.className = 'status-select';
                Object.entries(STATUS_LABELS).forEach(([value, label]) => {
                    const opt = document.createElement('option');
                    opt.value = value;
                    opt.textContent = label;
                    if (value === c.status) opt.selected = true;
                    select.appendChild(opt);
                });
                select.addEventListener('change', () => updateStatus(c.id, select.value));
                actionCell.appendChild(select);
            }
            queueBody.appendChild(tr);
        });
    }

    async function updateStatus(id, status) {
        try {
            await fetch(`/api/checkins/${id}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            loadQueue();
        } catch (e) {
            loadQueue();
        }
    }

    async function loadTimeSlots(dateStr) {
        try {
            const res = await fetch(`/api/slots?date=${encodeURIComponent(dateStr)}`);
            const data = await res.json();
            timeSlots = data.slots || [];
            populateTimeSlots();
        } catch (e) {
            console.error('Failed to load slots');
        }
    }

    function populateTimeSlots() {
        addTimeSelect.innerHTML = '<option value="">Select time</option>';
        timeSlots.forEach(slot => {
            if (slot.available > 0) {
                const opt = document.createElement('option');
                opt.value = slot.time;
                opt.textContent = formatTime(slot.time);
                addTimeSelect.appendChild(opt);
            }
        });
    }

    addDateInput.addEventListener('change', () => loadTimeSlots(addDateInput.value));

    addCheckinBtn.addEventListener('click', async () => {
        const name = addNameInput.value.trim();
        const phone = addPhoneInput.value.trim();
        const date = addDateInput.value;
        const time = addTimeSelect.value;
        const serviceNote = addServiceInput.value.trim();
        const duration = parseInt(addDurationSelect.value);

        addErrorEl.hidden = true;

        if (!name || !date || !time || !serviceNote || !duration) {
            addErrorEl.textContent = 'Please fill all required fields';
            addErrorEl.hidden = false;
            return;
        }

        addCheckinBtn.disabled = true;

        try {
            const res = await fetch('/api/checkin-by-staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, phone, date, time, service_note: serviceNote, duration_minutes: duration
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                addErrorEl.textContent = data.error || 'Failed to add check-in';
                addErrorEl.hidden = false;
                addCheckinBtn.disabled = false;
                return;
            }
            addNameInput.value = '';
            addPhoneInput.value = '';
            addServiceInput.value = '';
            addTimeSelect.value = '';
            addDurationSelect.value = '';
            document.getElementById('addCheckinForm').style.display = 'none';
            loadQueueWithTimeline();
            loadTimeSlots(date);
        } catch (e) {
            addErrorEl.textContent = 'Connection error';
            addErrorEl.hidden = false;
            addCheckinBtn.disabled = false;
        }
    });

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function renderTimeline(checkins) {
        const timeline = document.getElementById('timeline');
        timeline.innerHTML = '';

        if (!checkins.length) {
            timeline.innerHTML = '<p class="muted" style="padding: 8px;">No check-ins today</p>';
            return;
        }

        checkins.forEach(c => {
            const [h, m] = c.time.split(':').map(Number);
            const span = c.duration_minutes ? Math.ceil(c.duration_minutes / 30) : 1;
            const statusColor = {
                waiting_confirm: '#fbbf24',
                confirmed: '#60a5fa',
                in_service: '#34d399',
                complete: '#a78bfa',
                cancelled: '#ef5350'
            }[c.status] || '#9ca3af';

            const block = document.createElement('div');
            block.style.cssText = `
                flex: 0 0 ${span * 90}px;
                min-height: 60px;
                background: ${statusColor};
                border-radius: 8px;
                padding: 8px;
                color: white;
                font-size: 12px;
                font-weight: 600;
                display: flex;
                flex-direction: column;
                justify-content: center;
                cursor: pointer;
                opacity: 0.9;
            `;
            block.innerHTML = `
                <div>${formatTime(c.time)}</div>
                <div style="font-weight: 700; margin: 2px 0;">${escapeHtml(c.name)}</div>
                <div style="font-size: 11px; opacity: 0.9;">${c.duration_minutes || '?'} min</div>
            `;

            if (c.status === 'waiting_confirm') {
                block.addEventListener('click', () => showConfirmModal(c));
            }

            timeline.appendChild(block);
        });
    }

    function showConfirmModal(checkin) {
        pendingConfirmCheckinId = checkin.id;
        confirmModalName.textContent = checkin.name;
        confirmModalTime.textContent = `${checkin.date} at ${formatTime(checkin.time)}`;
        confirmModal.style.cssText = 'display: flex !important; pointer-events: auto !important;';
    }

    function hideConfirmModal() {
        confirmModal.style.cssText = 'display: none !important; pointer-events: none !important;';
        pendingConfirmCheckinId = null;
    }

    async function confirmDuration(duration) {
        if (!pendingConfirmCheckinId) return;

        try {
            const res = await fetch(`/api/checkins/${pendingConfirmCheckinId}/confirm-duration`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ duration_minutes: duration }),
            });
            if (res.ok) {
                hideConfirmModal();
                loadQueue();
            }
        } catch (e) {
            console.error('Confirm failed:', e);
        }
    }

    confirm30Btn.addEventListener('click', () => confirmDuration(30));
    confirm45Btn.addEventListener('click', () => confirmDuration(45));
    confirm60Btn.addEventListener('click', () => confirmDuration(60));
    confirmCancelBtn.addEventListener('click', hideConfirmModal);
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) hideConfirmModal();
    });

    function loadQueueWithTimeline(options) {
        const isFirstLoad = !(options && options.silent);
        if (isFirstLoad) {
            queueBody.innerHTML = '<tr><td colspan="7" class="muted">Loading&hellip;</td></tr>';
        }
        try {
            fetch(`/api/checkins?date=${encodeURIComponent(dateInput.value)}`)
                .then(res => res.json())
                .then(data => {
                    renderQueue(data.checkins || []);
                    renderTimeline(data.checkins || []);
                    updateStats(data.checkins || []);
                });
        } catch (e) {
            if (isFirstLoad) queueBody.innerHTML = '<tr><td colspan="7" class="muted">Connection error.</td></tr>';
        }
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to log out?')) {
                try {
                    const res = await fetch('/api/staff-logout', { method: 'POST' });
                    if (res.ok) {
                        window.location.href = '/staff-login';
                    }
                } catch (e) {
                    alert('Logout failed. Please try again.');
                }
            }
        });
    }

    dateInput.value = todayStr();
    addDateInput.value = todayStr();
    dateInput.addEventListener('change', loadQueueWithTimeline);
    refreshBtn.addEventListener('click', loadQueueWithTimeline);

    loadQueueWithTimeline();
    loadTimeSlots(todayStr());
    setInterval(() => loadQueueWithTimeline({ silent: true }), 10000);
})();
