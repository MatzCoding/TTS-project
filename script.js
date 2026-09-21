const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
document.getElementById('playBtn');
const stopBtn =
const playBtn =  document.getElementById('stopBtn');
const status = document.getElementById('status');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');

let voices = [];
let utterance = new SpeechSynthesisUtterance();
let isPlaying = false;

function updateStatus(message, type = 'ready') {
    statusText.textContent = message;

    switch(type) {
        case 'playing':
            statusDot.style.backgroundColor = '#4ade80';
            break;
        case 'completed':
            statusDot.style.backgroundColor = '#60a5fa';
            break;
        case 'error':
            statusDot.style.backgroundColor = '#f87171';
            break;
        case 'stopped':
            statusDot.style.backgroundColor = '#fbbf24';
            break;
        default:
            statusDot.style.backgroundColor = '#a78bfa';
    }
}

function validateInput() {
    const text = textInput.value.trim();

    if (!text) {
        updateStatus('Veuillez entrer du texte', 'error');
        textInput.focus();
        return false;
    }

    if (voiceSelect.value === '') {
        updateStatus('Veuillez choisir une voix', 'error');
        voiceSelect.focus();
        return false;
    }

    return true;
}

function setPlayingState() {
    playBtn.disabled = true;
    stopBtn.disabled = false;
    isPlaying = true;
}

function setStoppedState() {
    playBtn.disabled = false;
    stopBtn.disabled = true;
    isPlaying = false;
}

window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();

    voiceSelect.innerHTML = '<option value="">Choisir une voix...</option>';

    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        const type = voice.localService ? 'Local' : 'Distant';
        option.textContent = `${voice.name} (${voice.lang} - ${type})`;
        option.value = index;
        voiceSelect.appendChild(option);
    });

    const frenchVoice = voices.findIndex(v => v.lang.startsWith('fr'));
    if (frenchVoice !== -1) {
        voiceSelect.value = frenchVoice;
        utterance.voice = voices[frenchVoice];
    }
};

voiceSelect.addEventListener('change', () => {
    if (voiceSelect.value !== '') {
        utterance.voice = voices[voiceSelect.value];
    }
});

playBtn.addEventListener('click', () => {
    if (!validateInput()) {
        return;
    }

    utterance.text = textInput.value.trim();

    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(utterance);

    setPlayingState();
    updateStatus('Lecture en cours...', 'playing');
});

stopBtn.addEventListener('click', () => {
    window.speechSynthesis.cancel();

    setStoppedState();
    updateStatus('Arrêté', 'stopped');
});

utterance.onend = () => {
    setStoppedState();
    updateStatus('Terminé', 'completed');
};

utterance.onerror = (event) => {
    console.error('Erreur de synthèse vocale:', event.error);
    setStoppedState();
    updateStatus(`Erreur: ${event.error}`, 'error');
};

utterance.onstart = () => {
    setPlayingState();
    updateStatus('Lecture en cours...', 'playing');
};

utterance.onpause = () => {
    updateStatus('En pause', 'stopped');
};

utterance.onresume = () => {
    updateStatus('Reprise...', 'playing');
};

document.addEventListener('keydown', (e) => {
    if ((e.altKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        if (!playBtn.disabled) {
            playBtn.click();
        }
    }

    if ((e.altKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!stopBtn.disabled) {
            stopBtn.click();
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            voiceSelect.innerHTML = '<option value="">Choisir une voix...</option>';
            voices.forEach((voice, index) => {
                const option = document.createElement('option');
                const type = voice.localService ? 'Local' : 'Distant';
                option.textContent = `${voice.name} (${voice.lang} - ${type})`;
                option.value = index;
                voiceSelect.appendChild(option);
            });
            const frenchVoice = voices.findIndex(v => v.lang.startsWith('fr'));
            if (frenchVoice !== -1) {
                voiceSelect.value = frenchVoice;
                utterance.voice = voices[frenchVoice];
            }
        };
    }

    textInput.focus();

    updateStatus('Prêt', 'ready');

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
});
