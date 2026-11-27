export class AudioEngine {
  constructor() {
    this.context = null;
    this.muted = false;
    this.lastStep = 0;
    this.lastAmbience = 0;
    this.noise = null;
  }
  unlock() {
    if (!this.context) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      this.context = new Context();
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : 0.16;
      this.master.connect(this.context.destination);
      this.noise = this.context.createBuffer(1, this.context.sampleRate * 0.6, this.context.sampleRate);
      const samples = this.noise.getChannelData(0);
      let value = 0.27;
      for (let index = 0; index < samples.length; index++) {
        value = (value * 16807) % 2147483647;
        samples[index] = value / 1073741823.5 - 1;
      }
    }
    this.context.resume().catch(() => {});
  }
  toggle() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.16, this.context.currentTime, 0.03);
    return this.muted;
  }
  tone(frequency, end, duration, shape = 'sine', delay = 0, volume = 0.4) {
    if (!this.context || this.muted) return;
    const time = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = shape;
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, end), time + duration);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(volume, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.02);
  }
  hiss(duration = 0.12, cutoff = 900, volume = 0.25) {
    if (!this.context || this.muted) return;
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    source.buffer = this.noise;
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    const time = this.context.currentTime;
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    source.connect(filter).connect(gain).connect(this.master);
    source.start();
    source.stop(time + duration);
  }
  play(name) {
    if (name === 'jump' || name === 'gobble') {
      for (let index = 0; index < 4; index++) this.tone(245 + index * 40, 115, 0.09, 'triangle', index * 0.065, 0.5);
    } else if (name === 'corn') {
      this.tone(830, 1250, 0.1, 'sine');
    } else if (name === 'pie' || name === 'feather') {
      [660, 880, 1320].forEach((frequency, index) => this.tone(frequency, frequency, 0.16, 'triangle', index * 0.055));
    } else if (name === 'hit') {
      this.hiss(0.22, 450, 0.7);
      this.tone(180, 42, 0.3, 'sawtooth');
    } else if (name === 'dash' || name === 'knife') {
      this.hiss(0.22, 2800, 0.45);
    } else if (name === 'near') {
      this.tone(640, 1700, 0.22, 'sine', 0, 0.25);
    } else if (name === 'escape' || name === 'stage') {
      const notes = name === 'escape' ? [392, 523, 659, 784, 659, 1047] : [523, 659, 784];
      notes.forEach((frequency, index) => this.tone(frequency, frequency, 0.32, 'triangle', index * 0.13, 0.5));
    } else if (name === 'caught') {
      [294, 262, 196, 147].forEach((frequency, index) => this.tone(frequency, frequency * 0.8, 0.3, 'triangle', index * 0.17));
    }
  }
  tick(time, running, stage) {
    if (!running || !this.context) return;
    if (time - this.lastStep > 0.24) {
      this.lastStep = time;
      this.hiss(0.04, 350, 0.17);
    }
    if (stage === 2 && time - this.lastAmbience > 1.4) {
      this.lastAmbience = time;
      this.hiss(0.5, 3400, 0.085);
    }
  }
}
