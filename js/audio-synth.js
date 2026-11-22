// Web Audio API Synthesizer for Arduino Buzzer & Mini Piano Simulation
// Supports tone(pin, freq), noTone(pin), note triggering, volume limiting, and mute state.

class AudioSynth {
  constructor() {
    this.ctx = null;
    this.oscillator = null;
    this.gainNode = null;
    this.isMuted = false;
    this.currentFreq = 0;
    this.masterVolume = 0.15; // Safe comfortable level
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(frequency) {
    if (this.isMuted || !frequency || frequency <= 0) {
      this.stopTone();
      return;
    }

    this.init();
    if (!this.ctx) return;

    if (!this.oscillator) {
      this.oscillator = this.ctx.createOscillator();
      this.oscillator.type = 'square'; // Buzzer is square-wave
      this.oscillator.connect(this.gainNode);
      this.oscillator.start();
    }

    const now = this.ctx.currentTime;
    this.oscillator.frequency.cancelScheduledValues(now);
    this.oscillator.frequency.setValueAtTime(frequency, now);

    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.linearRampToValueAtTime(this.masterVolume, now + 0.01);
    this.currentFreq = frequency;
  }

  stopTone() {
    if (!this.ctx || !this.gainNode) return;
    const now = this.ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + 0.02);
    this.currentFreq = 0;
  }

  playNote(frequency, durationMs = 300) {
    this.playTone(frequency);
    setTimeout(() => {
      if (this.currentFreq === frequency) {
        this.stopTone();
      }
    }, durationMs);
  }

  triggerTone(frequency, duration = 0.08) {
    if (this.isMuted || !frequency || frequency <= 0) return;
    this.playTone(frequency);
    setTimeout(() => {
      this.stopTone();
    }, duration * 1000);
  }

  triggerClick() {
    this.triggerTone(1200, 0.02);
  }

  triggerSuccess() {
    this.triggerTone(880, 0.08);
    setTimeout(() => this.triggerTone(1320, 0.12), 90);
  }

  triggerBuzzerTone(frequency, duration = 0.1) {
    this.triggerTone(frequency, duration);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopTone();
    }
    return this.isMuted;
  }
}

// Global audio synthesizer instance
window.AudioSynth = AudioSynth;
window.audioSynth = new AudioSynth();
