// --- 1. GET ALL OUR HTML ELEMENTS ---
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const instructionText = document.getElementById('instruction-text');
const orbVisual = document.getElementById('orb-visual');
const durationInput = document.getElementById('duration-input');
const timeWrapper = document.querySelector('.time-input-wrapper');
const musicSelect = document.getElementById('music-select');
const musicWrapper = document.querySelector('.music-select-wrapper');
const streakCountDisplay = document.getElementById('streak-count');
const streakWrapper = document.querySelector('.streak-counter-wrapper');

// --- 2. LOAD OUR SOUNDS ---
const bellSound = new Audio('sounds/bell.mp3');
const gongSound = new Audio('sounds/gong.mp3');
const bgMusic = {
    rain: new Audio('sounds/rain.mp3'),
    forest: new Audio('sounds/forest.mp3')
};
let currentMusic = null;

// --- 3. SET BREATHING TIMINGS ---
const INHALE_TIME = 4000;
const HOLD_TIME = 7000;
const EXHALE_TIME = 8000;
const CYCLE_TIME = INHALE_TIME + HOLD_TIME + EXHALE_TIME;

// --- 4. TIMER VARIABLES ---
let cycleInterval = null;
let sessionTimeout = null;
let holdTimeout = null;
let exhaleTimeout = null;
let prepInterval = null; // <-- RENAMED from prepTimeout
let prepSeconds = 5;     // <-- NEW countdown variable

// --- 5. LISTEN FOR BUTTON CLICKS & PAGE LOAD ---
startButton.addEventListener('click', startMeditation);
stopButton.addEventListener('click', () => endMeditation(false));
document.addEventListener('DOMContentLoaded', displayStreak);

// --- 6. START/STOP FUNCTIONS ---
function startMeditation() {
    // 1. HIDE CONTROLS
    startButton.classList.add('hidden');
    stopButton.classList.remove('hidden');
    timeWrapper.classList.add('hidden');
    musicWrapper.classList.add('hidden');
    streakWrapper.classList.add('hidden');
    
    // Prime sounds
    bellSound.load();
    gongSound.load();

    // 2. CALCULATE TIME
    const minutes = parseInt(durationInput.value);
    const totalSeconds = minutes * 60;
    const totalCycles = Math.round(totalSeconds / 19);
    const exactTotalTime = totalCycles * CYCLE_TIME;

    // 3. START 5-SECOND COUNTDOWN
    prepSeconds = 5; // Reset countdown
    instructionText.textContent = `Get ready... ${prepSeconds}`; // Show "5" immediately

    prepInterval = setInterval(() => {
        prepSeconds--; // Decrement
        
        if (prepSeconds < 0) {
            // Countdown finished, start the session
            clearInterval(prepInterval); // Stop this countdown timer
            
            // --- START ACTUAL MEDITATION ---
            // A. Start Background Music
            const selectedMusic = musicSelect.value;
            if (selectedMusic !== 'none') {
                currentMusic = bgMusic[selectedMusic];
                currentMusic.loop = true;
                currentMusic.play();
            }

            // B. Start Visual animation
            orbVisual.style.opacity = '0.7';
            orbVisual.classList.add('is-breathing');

            // C. Start Text and Sound cycle
            runTextAndSoundCycle(); // Run first cycle
            cycleInterval = setInterval(runTextAndSoundCycle, CYCLE_TIME);

            // D. Schedule the end
            sessionTimeout = setTimeout(() => endMeditation(true), exactTotalTime);
            // --- END ACTUAL MEDITATION ---

        } else {
            // Continue countdown
            instructionText.textContent = `Get ready... ${prepSeconds}`;
        }
    }, 1000); // 1000ms = 1 second
}

function runTextAndSoundCycle() {
    instructionText.textContent = 'Inhale...';
    bellSound.play();

    holdTimeout = setTimeout(() => {
        instructionText.textContent = 'Hold...';
        bellSound.play();
    }, INHALE_TIME);

    exhaleTimeout = setTimeout(() => {
        instructionText.textContent = 'Exhale...';
        bellSound.play();
    }, INHALE_TIME + HOLD_TIME);
}

function endMeditation(wasCompleted) {
    // STOP ALL PENDING TIMERS
    clearInterval(cycleInterval);
    clearTimeout(sessionTimeout);
    clearTimeout(holdTimeout);
    clearTimeout(exhaleTimeout);
    clearInterval(prepInterval); // <-- UPDATED to clearInterval

    // Stop visual animation
    orbVisual.classList.remove('is-breathing');
    orbVisual.style.opacity = '0';
    
    // Stop background music
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
        currentMusic = null;
    }

    // --- STREAK LOGIC ---
    if (wasCompleted) {
        gongSound.play();
        instructionText.textContent = 'Session Complete';
        updateStreak(); 
    } else {
        instructionText.textContent = 'Press Start to Begin';
    }
    
    displayStreak(); 

    // Show controls again
    startButton.classList.remove('hidden');
    stopButton.classList.add('hidden');
    timeWrapper.classList.remove('hidden');
    musicWrapper.classList.remove('hidden');
    streakWrapper.classList.remove('hidden');
}

// --- 7. STREAK COUNTER LOGIC ---
// (This section is unchanged)

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function getStreakData() {
    const data = JSON.parse(localStorage.getItem('meditationStreak')) || {};
    return {
        count: data.count || 0,
        lastSession: data.lastSession || null
    };
}

function saveStreakData(count, dateString) {
    const data = { count: count, lastSession: dateString };
    localStorage.setItem('meditationStreak', JSON.stringify(data));
}

function displayStreak() {
    const data = getStreakData();
    streakCountDisplay.textContent = data.count;
}

function updateStreak() {
    const today = getTodayString();
    const data = getStreakData();

    if (data.lastSession === today) {
        return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    if (data.lastSession === yesterdayString) {
        saveStreakData(data.count + 1, today);
    } else {
        saveStreakData(1, today);
    }
}