(function () {
    const dateInput = document.getElementById('date');
    const slotGrid = document.getElementById('slotGrid');
    const selectedTimeInput = document.getElementById('selectedTime');
    const form = document.getElementById('checkinForm');
    const formError = document.getElementById('formError');
    const submitBtn = document.getElementById('submitBtn');
    const serviceNote = document.getElementById('serviceNote');
    const chips = document.querySelectorAll('.chip');

    const formView = document.getElementById('formView');
    const confirmView = document.getElementById('confirmView');
    const newCheckinBtn = document.getElementById('newCheckinBtn');

    function todayStr() {
        const d = new Date();
        const offset = d.getTimezoneOffset();
        const local = new Date(d.getTime() - offset * 60 * 1000);
        return local.toISOString().slice(0, 10);
    }

    function initDateInput() {
        const today = todayStr();
        const max = new Date();
        max.setDate(max.getDate() + (window.SALON_CONFIG.maxDaysAhead - 1));
        const offset = max.getTimezoneOffset();
        const maxLocal = new Date(max.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);

        dateInput.min = today;
        dateInput.max = maxLocal;
        dateInput.value = today;
    }

    function showError(message) {
        formError.textContent = message;
        formError.hidden = false;
    }

    function clearError() {
        formError.hidden = true;
        formError.textContent = '';
    }

    let slotsRequestToken = 0;

    async function loadSlots(options) {
        options = options || {};
        const isFirstLoad = options.reset !== false && slotGrid.dataset.loaded !== '1';
        if (isFirstLoad) {
            selectedTimeInput.value = '';
            slotGrid.innerHTML = '<p class="muted">Loading available times&hellip;</p>';
        }
        const requestToken = ++slotsRequestToken;
        try {
            const res = await fetch(`/api/slots?date=${encodeURIComponent(dateInput.value)}`);
            const data = await res.json();
            if (requestToken !== slotsRequestToken) return; // a newer request/date change won.
            if (!res.ok) {
                slotGrid.innerHTML = `<p class="muted">${data.error || 'Unable to load times.'}</p>`;
                return;
            }
            renderSlots(data.slots, selectedTimeInput.value);
            slotGrid.dataset.loaded = '1';
        } catch (e) {
            if (requestToken !== slotsRequestToken) return;
            if (isFirstLoad) slotGrid.innerHTML = '<p class="muted">Connection error. Please try again.</p>';
        }
    }

    function renderSlots(slots, previouslySelected) {
        if (!slots.length) {
            slotGrid.innerHTML = '<p class="muted">No more slots available for this date.</p>';
            selectedTimeInput.value = '';
            return;
        }
        slotGrid.innerHTML = '';
        let stillAvailable = false;
        slots.forEach((slot) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'slot-btn' + (slot.available <= 0 ? ' full' : '');
            btn.disabled = slot.available <= 0;
            btn.dataset.time = slot.time;
            btn.innerHTML = `${formatTime(slot.time)}<span class="avail">${
                slot.available <= 0 ? 'Full' : slot.available + ' open'
            }</span>`;
            btn.addEventListener('click', () => selectSlot(btn));
            if (previouslySelected && slot.time === previouslySelected) {
                if (slot.available > 0) {
                    btn.classList.add('selected');
                    stillAvailable = true;
                }
            }
            slotGrid.appendChild(btn);
        });
        if (previouslySelected && !stillAvailable) {
            selectedTimeInput.value = '';
        }
    }

    function startSlotsAutoRefresh() {
        setInterval(() => {
            if (!formView.hidden) loadSlots({ reset: false });
        }, 15000);
    }

    function formatTime(t) {
        const [h, m] = t.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
    }

    function selectSlot(btn) {
        slotGrid.querySelectorAll('.slot-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedTimeInput.value = btn.dataset.time;
    }

    chips.forEach((chip) => {
        chip.addEventListener('click', () => {
            const service = chip.dataset.service;
            chip.classList.toggle('active');
            const current = serviceNote.value.trim();
            const parts = current ? current.split(',').map((s) => s.trim()).filter(Boolean) : [];
            const idx = parts.indexOf(service);
            if (chip.classList.contains('active')) {
                if (idx === -1) parts.push(service);
            } else if (idx !== -1) {
                parts.splice(idx, 1);
            }
            serviceNote.value = parts.join(', ');
        });
    });

    dateInput.addEventListener('change', () => {
        delete slotGrid.dataset.loaded;
        loadSlots();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();

        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const nickname = document.getElementById('nickname').value.trim();
        const date = dateInput.value;
        const time = selectedTimeInput.value;
        const note = serviceNote.value.trim();

        if (!name) return showError('Please enter your name.');
        if (!time) return showError('Please choose a time slot.');
        if (!note) return showError("Please add a note about the service you'd like.");

        submitBtn.disabled = true;
        submitBtn.textContent = 'Checking in…';

        try {
            const res = await fetch('/api/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, nickname, date, time, service_note: note }),
            });
            const data = await res.json();
            if (!res.ok) {
                showError(data.error || 'Something went wrong. Please try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Check In';
                loadSlots();
                return;
            }
            showConfirmation(data.checkin);
        } catch (err) {
            showError('Connection error. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Check In';
        }
    });

    function showConfirmation(checkin) {
        document.getElementById('confirmName').textContent = checkin.name;
        document.getElementById('confirmDate').textContent = checkin.date;
        document.getElementById('confirmTime').textContent = formatTime(checkin.time);
        document.getElementById('confirmNote').textContent = checkin.service_note;
        formView.hidden = true;
        confirmView.hidden = false;
    }

    newCheckinBtn.addEventListener('click', () => {
        form.reset();
        chips.forEach((c) => c.classList.remove('active'));
        initDateInput();
        delete slotGrid.dataset.loaded;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Check In';
        confirmView.hidden = true;
        formView.hidden = false;
        loadSlots();
    });

    initDateInput();
    loadSlots();
    startSlotsAutoRefresh();
})();
