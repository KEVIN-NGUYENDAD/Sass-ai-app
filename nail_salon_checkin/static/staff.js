(function () {
    const dateInput = document.getElementById('staffDate');
    const refreshBtn = document.getElementById('refreshBtn');
    const queueBody = document.getElementById('queueBody');

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
        } catch (e) {
            if (isFirstLoad) queueBody.innerHTML = '<tr><td colspan="7" class="muted">Connection error.</td></tr>';
        }
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
            // reload regardless so UI reflects server state
            loadQueue();
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    dateInput.value = todayStr();
    dateInput.addEventListener('change', loadQueue);
    refreshBtn.addEventListener('click', loadQueue);

    loadQueue();
    setInterval(() => loadQueue({ silent: true }), 10000);
})();
