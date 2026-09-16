/* =====================================================================
   CYBERNETIC AUDIO SYNTHESIZER (WEB AUDIO API)
   Procedural ambient drone, hover frequencies & navigation swooshes
   ===================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.droneGain = null;
    this.osc1 = null;
    this.osc2 = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch (e) {
      console.warn('[Audio] Web Audio API not supported');
    }
  }

  toggle() {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.enabled = !this.enabled;
    if (this.enabled) {
      this.startDrone();
      this.playBeep(880, 0.1, 0.05);
    } else {
      this.stopDrone();
    }
    return this.enabled;
  }

  startDrone() {
    if (!this.ctx || this.droneGain) return;
    try {
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      this.droneGain.connect(this.ctx.destination);

      // Low frequency sci-fi resonance
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sine';
      this.osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note
      this.osc1.connect(this.droneGain);
      this.osc1.start();

      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(110.5, this.ctx.currentTime); // Slight detuned harmonic
      this.osc2.connect(this.droneGain);
      this.osc2.start();
    } catch (e) {
      console.warn('[Audio] Failed to start drone', e);
    }
  }

  stopDrone() {
    if (this.droneGain) {
      try {
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
        setTimeout(() => {
          if (this.osc1) { this.osc1.stop(); this.osc1.disconnect(); this.osc1 = null; }
          if (this.osc2) { this.osc2.stop(); this.osc2.disconnect(); this.osc2 = null; }
          if (this.droneGain) { this.droneGain.disconnect(); this.droneGain = null; }
        }, 450);
      } catch (e) {}
    }
  }

  playHover() {
    if (!this.enabled || !this.ctx) return;
    this.playBeep(1200 + Math.random() * 200, 0.04, 0.02);
  }

  playClick() {
    if (!this.enabled || !this.ctx) return;
    this.playBeep(440, 0.08, 0.06);
    setTimeout(() => this.playBeep(880, 0.12, 0.08), 40);
  }

  playTransition() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
  }

  playBeep(freq, duration, volume = 0.05) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }
}

export const audio = new SoundEngine();
