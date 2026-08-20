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

    function validatePhone(phone) {
        if (!phone || phone.trim().length < 7) return false;
        return /[\d\-\+\(\)\s]+/.test(phone);
    }

    function validateName(name) {
        return name && name.trim().length >= 1 && name.trim().length <= 100;
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
        dateInput.setAttribute('aria-label', 'Select date for appointment');
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
    let currentLoadedDate = null;

    async function loadSlots(options) {
        options = options || {};
        const isFirstLoad = options.reset !== false && slotGrid.dataset.loaded !== '1';
        if (isFirstLoad) {
            selectedTimeInput.value = '';
            slotGrid.innerHTML = '<p class="muted">Loading available times&hellip;</p>';
        }
        const requestedDate = dateInput.value;
        const requestToken = ++slotsRequestToken;
        try {
            const res = await fetch(`/api/slots?date=${encodeURIComponent(requestedDate)}`);
            const data = await res.json();
            if (requestToken !== slotsRequestToken) return; // a newer request/date change won.
            if (!res.ok) {
                slotGrid.innerHTML = `<p class="muted">${data.error || 'Unable to load times.'}</p>`;
                currentLoadedDate = null;
                return;
            }
            if (data.date !== requestedDate) {
                console.warn('Stale response: requested', requestedDate, 'got', data.date);
                return;
            }
            renderSlots(data.slots, selectedTimeInput.value, requestedDate);
            slotGrid.dataset.loaded = '1';
            currentLoadedDate = requestedDate;
        } catch (e) {
            if (requestToken !== slotsRequestToken) return;
            if (isFirstLoad) slotGrid.innerHTML = '<p class="muted">Connection error. Please try again.</p>';
            currentLoadedDate = null;
        }
    }

    function renderSlots(slots, previouslySelected, loadedForDate) {
        if (!slots.length) {
            slotGrid.innerHTML = '<p class="muted">No more slots available for this date.</p>';
            selectedTimeInput.value = '';
            currentLoadedDate = loadedForDate;
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
            btn.setAttribute('role', 'radio');
            btn.setAttribute('aria-label', `${formatTime(slot.time)} slot${slot.available <= 0 ? ' (full)' : ''}`);
            btn.innerHTML = `${formatTime(slot.time)}<span class="avail">${
                slot.available <= 0 ? 'Full' : slot.available + ' open'
            }</span>`;
            btn.addEventListener('click', () => selectSlot(btn));
            if (previouslySelected && slot.time === previouslySelected) {
                if (slot.available > 0) {
                    btn.classList.add('selected');
                    btn.setAttribute('aria-pressed', 'true');
                    stillAvailable = true;
                } else {
                    btn.setAttribute('aria-pressed', 'false');
                }
            } else {
                btn.setAttribute('aria-pressed', 'false');
            }
            slotGrid.appendChild(btn);
        });
        if (previouslySelected && !stillAvailable) {
            selectedTimeInput.value = '';
        }
        currentLoadedDate = loadedForDate;
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
        slotGrid.querySelectorAll('.slot-btn').forEach((b) => {
            b.classList.remove('selected');
            b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
        selectedTimeInput.value = btn.dataset.time;
    }

    function updateChipsFromNote() {
        const current = serviceNote.value.trim();
        const parts = current ? current.split(',').map((s) => s.trim()).filter(Boolean) : [];
        chips.forEach((chip) => {
            const service = chip.dataset.service;
            const isInNote = parts.some(p => p.toLowerCase() === service.toLowerCase());
            if (isInNote) {
                chip.classList.add('active');
                chip.setAttribute('aria-pressed', 'true');
            } else {
                chip.classList.remove('active');
                chip.setAttribute('aria-pressed', 'false');
            }
        });
    }

    function updateNoteFromChips() {
        const activeChips = Array.from(chips).filter((c) => c.classList.contains('active'));
        const services = activeChips.map((c) => c.dataset.service);
        serviceNote.value = services.length > 0 ? services.join(', ') : '';
    }

    chips.forEach((chip) => {
        chip.setAttribute('role', 'button');
        chip.setAttribute('aria-pressed', 'false');
        chip.addEventListener('click', () => {
            const service = chip.dataset.service;
            chip.classList.toggle('active');
            const isActive = chip.classList.contains('active');
            chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            updateNoteFromChips();
        });
    });

    serviceNote.addEventListener('change', updateChipsFromNote);
    serviceNote.addEventListener('blur', updateChipsFromNote);

    dateInput.addEventListener('change', () => {
        selectedTimeInput.value = '';
        slotGrid.innerHTML = '<p class="muted">Loading available times&hellip;</p>';
        delete slotGrid.dataset.loaded;
        loadSlots();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();

        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        const nicknameInput = document.getElementById('nickname');

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const nickname = nicknameInput.value.trim();
        const date = dateInput.value;
        const time = selectedTimeInput.value;
        const note = serviceNote.value.trim();

        if (!validateName(name)) {
            nameInput.setAttribute('aria-invalid', 'true');
            return showError('Please enter a valid name (1-100 characters).');
        }
        if (!validatePhone(phone)) {
            phoneInput.setAttribute('aria-invalid', 'true');
            return showError('Please enter a valid phone number (at least 7 digits).');
        }
        if (!time) return showError('Please choose a time slot.');
        if (!note) return showError("Please add a note about the service you'd like.");
        if (currentLoadedDate !== date) {
            return showError('Please reload the page to refresh available times.');
        }

        nameInput.removeAttribute('aria-invalid');
        phoneInput.removeAttribute('aria-invalid');

        if (submitBtn.disabled) return; // Prevent double-submission
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
        chips.forEach((c) => {
            c.classList.remove('active');
            c.setAttribute('aria-pressed', 'false');
        });
        clearError();
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
