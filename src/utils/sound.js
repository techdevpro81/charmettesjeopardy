let currentMusic = null;
let currentNarration = null;
let isMuted = false;

export const getIsMuted = () => isMuted;

export const setMuted = (muted) => {
  isMuted = muted;
  if (isMuted) {
    stopThemeMusic();
    stopClueNarration();
  }
};

export const toggleMute = () => {
  setMuted(!isMuted);
  return isMuted;
};

// Web Audio API Synthesizer for instant reliable SFX
const playSynthesizedChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Tone 1: C5 (523.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.3);

    // Tone 2: G5 (783.99 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.warn("Web Audio chime failed", e);
  }
};

const playSynthesizedBuzzer = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime); // Low buzz frequency
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn("Web Audio buzzer failed", e);
  }
};

const playMusicWithFallback = (preferredSrc, fallbackSrc) => {
  if (isMuted) return;
  try {
    if (currentMusic) {
      currentMusic.pause();
      currentMusic.currentTime = 0;
    }
    
    currentMusic = new Audio(preferredSrc);
    currentMusic.loop = true;
    
    const handleError = () => {
      if (isMuted) return;
      console.warn(`Failed to play preferred track: ${preferredSrc}. Trying fallback: ${fallbackSrc}`);
      // Remove listener to prevent infinite loop
      currentMusic.removeEventListener('error', handleError);
      currentMusic = new Audio(fallbackSrc);
      currentMusic.loop = true;
      currentMusic.play().catch(e => console.error("Fallback playback failed", e));
    };

    currentMusic.addEventListener('error', handleError);
    currentMusic.play().catch(e => {
      // Browsers may block audio autoplay until user interaction, handle it gracefully
      console.log("Audio autoplay waiting for user interaction or fallback", e);
    });
  } catch (e) {
    console.error("Music playback failed", e);
  }
};

export const playIntroMusic = () => {
  if (isMuted) return;
  playMusicWithFallback('/sounds/intro.mp3', '/sounds/theme.mp3');
};

export const playThemeMusic = () => {
  if (isMuted) return;
  playMusicWithFallback('/sounds/theme.mp3', '/sounds/theme.mp3');
};

export const playOutroMusic = () => {
  if (isMuted) return;
  playMusicWithFallback('/sounds/outro.mp3', '/sounds/theme.mp3');
};

export const stopThemeMusic = () => {
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
  }
};

export const playCorrectSound = () => {
  if (isMuted) return;
  playSynthesizedChime();
  try {
    const audio = new Audio('/sounds/correct.mp3');
    audio.play().catch(() => {});
  } catch (e) {}
};

export const playIncorrectSound = () => {
  if (isMuted) return;
  playSynthesizedBuzzer();
  try {
    const audio = new Audio('/sounds/incorrect.mp3');
    audio.play().catch(() => {});
  } catch (e) {}
};

export const playBoardRevealSound = () => {
  if (isMuted) return;
  try {
    const audio = new Audio('/sounds/board.mp3');
    audio.play().catch(() => {});
  } catch (e) {}
};

export const speakTextFallback = (text) => {
  if (isMuted) return;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && text) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David') || v.name.includes('Zira') || v.name.includes('Samantha')));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("SpeechSynthesis failed:", err);
    }
  }
};

export const playFullAnnouncerSound = () => {
  if (isMuted) return;
  stopClueNarration();
  try {
    currentNarration = new Audio('/sounds/announcer_full.mp3');
    return currentNarration.play().catch(e => console.warn("Full announcer audio blocked or failed", e));
  } catch (e) {
    console.error("Full announcer playback error", e);
  }
};

export const playAnnouncerSound = (index) => {
  if (isMuted) return;
  stopClueNarration();
  try {
    currentNarration = new Audio(`/sounds/announcer_${index}.mp3`);
    return currentNarration.play().catch(e => console.warn(`Announcer sound announcer_${index}.mp3 failed`, e));
  } catch (e) {
    console.error("Announcer playback error", e);
  }
};

export const playClueNarration = (clueId, clueText) => {
  if (isMuted) return;
  stopClueNarration();
  let audioPlayed = false;

  if (clueId) {
    try {
      const audio = new Audio(`/sounds/clues/${clueId}.mp3`);
      currentNarration = audio;
      audio.play().then(() => {
        audioPlayed = true;
      }).catch(e => {
        if (!isMuted) speakTextFallback(clueText);
      });
    } catch (e) {
      if (!isMuted) speakTextFallback(clueText);
    }
  } else {
    if (!isMuted) speakTextFallback(clueText);
  }
};

export const stopClueNarration = () => {
  if (currentNarration) {
    try {
      currentNarration.pause();
      currentNarration.currentTime = 0;
      currentNarration.src = '';
    } catch (e) {}
    currentNarration = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
};

