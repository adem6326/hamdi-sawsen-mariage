/* ==========================================================================
   MARIAGE HAMDI & SAWSEN - INTERACTIVE JAVASCRIPT
   Countdown, RSVP Handler, Guestbook Persistence, Confetti & Ambient Music
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 1. COUNTDOWN TIMER TO AUGUST 19, 2026 (A9ED EL 9IRAN) / AUGUST 21
    const weddingDate = new Date('2026-08-19T19:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            document.getElementById('days').innerText = "00";
            document.getElementById('hours').innerText = "00";
            document.getElementById('minutes').innerText = "00";
            document.getElementById('seconds').innerText = "00";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // 2. NAVBAR SCROLL EFFECT
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. MOBILE DRAWER MENU
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeDrawerBtn = document.getElementById('closeDrawer');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileLinks = document.querySelectorAll('.m-link');

    if (mobileMenuBtn && mobileDrawer) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileDrawer.classList.add('active');
        });

        closeDrawerBtn.addEventListener('click', () => {
            mobileDrawer.classList.remove('active');
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.remove('active');
            });
        });
    }

    // 4. RSVP FORM SUBMISSION & CONFETTI
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpSuccess = document.getElementById('rsvpSuccess');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('guestName').value;
            const phone = document.getElementById('guestPhone').value;
            const count = document.getElementById('guestCount').value;
            const status = document.getElementById('guestStatus').value;
            const message = document.getElementById('guestMessage').value;

            // Gather selected events
            const selectedEvents = Array.from(document.querySelectorAll('input[name="events"]:checked'))
                .map(cb => cb.value);

            const rsvpData = {
                name,
                phone,
                count,
                status,
                events: selectedEvents,
                message,
                timestamp: new Date().toISOString()
            };

            // Save to LocalStorage
            let storedRSVP = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
            storedRSVP.push(rsvpData);
            localStorage.setItem('wedding_rsvps', JSON.stringify(storedRSVP));

            // Launch Confetti Celebration
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#d4af37', '#b76e79', '#ffffff', '#4cd964']
                });
            }

            // UI Transition
            rsvpForm.style.display = 'none';
            rsvpSuccess.classList.add('active');
        });
    }

    // 5. GUESTBOOK / LIVRE D'OR PERSISTENCE & ADDITION
    const wishForm = document.getElementById('wishForm');
    const wishesGrid = document.getElementById('wishesGrid');

    function loadWishes() {
        const storedWishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
        storedWishes.reverse().forEach(wish => {
            renderWishCard(wish.author, wish.message, wish.date);
        });
    }

    function renderWishCard(author, message, dateText = 'Récemment') {
        const card = document.createElement('div');
        card.className = 'wish-card';
        card.style.animation = 'fadeIn 0.5s ease';
        card.innerHTML = `
            <div class="wish-icon"><i class="fa-solid fa-quote-left"></i></div>
            <p class="wish-text">"${escapeHtml(message)}"</p>
            <div class="wish-footer">
                <span class="wish-author">${escapeHtml(author)}</span>
                <span class="wish-date"><i class="fa-regular fa-clock"></i> ${dateText}</span>
            </div>
        `;
        wishesGrid.prepend(card);
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, (m) => {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[m];
        });
    }

    if (wishForm) {
        wishForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const authorInput = document.getElementById('wishAuthor');
            const messageInput = document.getElementById('wishMessage');

            const author = authorInput.value.trim();
            const message = messageInput.value.trim();

            if (author && message) {
                renderWishCard(author, message, 'À l\'instant');

                // Save to LocalStorage
                let storedWishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
                storedWishes.push({
                    author,
                    message,
                    date: 'À l\'instant'
                });
                localStorage.setItem('wedding_wishes', JSON.stringify(storedWishes));

                // Trigger mini confetti
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 50,
                        spread: 50,
                        origin: { y: 0.8 },
                        colors: ['#d4af37', '#e5ca79']
                    });
                }

                // Clear input
                authorInput.value = '';
                messageInput.value = '';
            }
        });

        loadWishes();
    }

    // 6. AMBIENT MUSIC SYNTHESIZER (WEB AUDIO API)
    const musicToggle = document.getElementById('musicToggle');
    let audioCtx = null;
    let isPlaying = false;
    let synthTimer = null;

    // Romantic Pentatonic Chords Frequencies (F Major / D minor warmth)
    const notes = [174.61, 220.00, 261.63, 329.63, 392.00, 440.00, 523.25]; // F3, A3, C4, E4, G4, A4, C5

    function playRomanticMelody() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        const noteFreq = notes[Math.floor(Math.random() * notes.length)];

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq, now);

        // Soft envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 3.2);
    }

    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            if (!isPlaying) {
                isPlaying = true;
                musicToggle.classList.add('playing');
                playRomanticMelody();
                synthTimer = setInterval(playRomanticMelody, 1600);
            } else {
                isPlaying = false;
                musicToggle.classList.remove('playing');
                if (synthTimer) clearInterval(synthTimer);
            }
        });
    }

});
