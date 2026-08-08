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

    let timeSlots = [];

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
        waiting: 'Waiting',
        in_service: 'In Service',
        done: 'Done',
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
            loadQueue();
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

    dateInput.value = todayStr();
    addDateInput.value = todayStr();
    dateInput.addEventListener('change', loadQueue);
    refreshBtn.addEventListener('click', loadQueue);

    loadQueue();
    loadTimeSlots(todayStr());
    setInterval(() => loadQueue({ silent: true }), 10000);
})();
