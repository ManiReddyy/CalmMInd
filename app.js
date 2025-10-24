// --- 1. GET ALL OUR HTML ELEMENTS ---
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const instructionText = document.getElementById('instruction-text');
const orbVisual = document.getElementById('orb-visual');
const durationInput = document.getElementById('duration-input');
const timeWrapper = document.querySelector('.time-input-wrapper');

// New Music Elements
const musicSelect = document.getElementById('music-select'); // The dropdown
const musicWrapper = document.querySelector('.music-select-wrapper');

// --- 2. LOAD OUR SOUNDS ---
const bellSound = new Audio('sounds/bell.mp3');
const gongSound = new Audio('sounds/gong.mp3');

// New Background Music Library
const bgMusic = {
    rain: new Audio('sounds/rain.mp3'),
    forest: new Audio('sounds/forest.mp3')
};

// Variable to hold the currently playing music
let currentMusic = null;

// --- 3. SET BREATHING TIMINGS (in milliseconds) ---
const INHALE_TIME = 4000;
const HOLD_TIME = 7000;
const EXHALE_TIME = 8000;
const CYCLE_TIME = INHALE_TIME + HOLD_TIME + EXHALE_TIME; // 19000 ms total

// --- 4. TIMER VARIABLES ---
let cycleInterval = null;
let sessionTimeout = null;

// --- 5. LISTEN FOR BUTTON CLICKS ---
startButton.addEventListener('click', startMeditation);
stopButton.addEventListener('click', () => endMeditation(false));

function startMeditation() {
    // --- 6. HIDE/SHOW ELEMENTS ---
    startButton.classList.add('hidden');
    stopButton.classList.remove('hidden');
    timeWrapper.classList.add('hidden');
    musicWrapper.classList.add('hidden'); // Hide music dropdown

    // --- 7. CALCULATE TOTAL TIME ---
    const minutes = parseInt(durationInput.value);
    const totalSeconds = minutes * 60;
    const totalCycles = Math.round(totalSeconds / 19);
    const exactTotalTime = totalCycles * CYCLE_TIME;

    // --- 8. START THE CYCLES & MUSIC ---

    // A. Start Background Music
    const selectedMusic = musicSelect.value; // Get "rain", "forest", or "none"
    if (selectedMusic !== 'none') {
        currentMusic = bgMusic[selectedMusic]; // Get the Audio object
        currentMusic.loop = true; // Make it loop
        currentMusic.play();
    }

    // B. Start the VISUAL animation
    orbVisual.style.opacity = '0.7';
    orbVisual.classList.add('is-breathing');

    // C. Start the TEXT and SOUND cycle
    runTextAndSoundCycle();
    cycleInterval = setInterval(runTextAndSoundCycle, CYCLE_TIME);

    // D. Schedule the end of the session
    sessionTimeout = setTimeout(() => endMeditation(true), exactTotalTime);
}

function runTextAndSoundCycle() {
    instructionText.textContent = 'Inhale...';
    bellSound.play();

    setTimeout(() => {
        instructionText.textContent = 'Hold...';
        bellSound.play();
    }, INHALE_TIME);

    setTimeout(() => {
        instructionText.textContent = 'Exhale...';
        bellSound.play();
    }, INHALE_TIME + HOLD_TIME);
}

function endMeditation(wasCompleted) {
    // --- 9. STOP ALL TIMERS, ANIMATIONS, & MUSIC ---
    clearInterval(cycleInterval);
    clearTimeout(sessionTimeout);
    orbVisual.classList.remove('is-breathing');
    orbVisual.style.opacity = '0';

    // Stop background music if it's playing
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0; // Reset to start
        currentMusic = null;
    }

    // --- 10. PLAY SOUND & RESET UI ---
    if (wasCompleted) {
        gongSound.play();
        instructionText.textContent = 'Session Complete';
    } else {
        instructionText.textContent = 'Press Start to Begin';
    }

    // Show controls again
    startButton.classList.remove('hidden');
    stopButton.classList.add('hidden');
    timeWrapper.classList.remove('hidden');
    musicWrapper.classList.remove('hidden'); // Show music dropdown again
}