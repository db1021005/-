/**
 * WebAudio 96kHz Low-Latency DSP Engine
 * Realistic acoustic/electric guitar pluck synthesis, chord strumming, arpeggios, metronome, and SFX.
 */

class GuitarAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private metronomeTimer: number | null = null;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.85, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Plays a physical guitar string pluck tone using multi-oscillator harmonic layering and decay envelope.
   */
  public playPluck(frequency: number, duration: number = 1.2, velocity: number = 0.8): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // Master pluck node
      const noteGain = ctx.createGain();
      noteGain.connect(this.masterGain!);

      // Exponential decay envelope
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(0.4 * velocity, now + 0.008);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Lowpass tone filter to simulate wood and string warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(frequency * 5, 4500), now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(frequency * 1.5, 300), now + duration);
      filter.Q.setValueAtTime(2.0, now);

      // Fundamental oscillator: Triangle
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(frequency, now);

      // 2nd Harmonic oscillator: Sawtooth for metallic bite
      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(frequency * 2, now);
      const osc2Gain = ctx.createGain();
      osc2Gain.gain.setValueAtTime(0.18, now);
      osc2Gain.gain.exponentialRampToValueAtTime(0.001, now + (duration * 0.4));

      // Connect
      osc1.connect(filter);
      osc2.connect(osc2Gain);
      osc2Gain.connect(filter);
      filter.connect(noteGain);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + duration);
      osc2.stop(now + duration);

      setTimeout(() => {
        noteGain.disconnect();
      }, (duration + 0.1) * 1000);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Strum multiple notes with realistic humanized 40~65ms picking stroke stagger.
   */
  public strumChord(frequencies: number[], bpm: number = 100, onProgress?: (index: number) => void): void {
    if (this.isMuted || frequencies.length === 0) return;
    // Stroke interval based on 60~75ms delay
    const staggerMs = Math.max(35, Math.min(75, 60000 / (bpm * 10)));

    frequencies.forEach((freq, idx) => {
      setTimeout(() => {
        this.playPluck(freq, 1.8, 0.75 + (idx % 2 === 0 ? 0.15 : 0));
        if (onProgress) onProgress(idx);
      }, idx * staggerMs);
    });
  }

  /**
   * Arpeggiate scale notes up and down
   */
  public playScaleRun(frequencies: number[], noteDelayMs: number = 160, onNotePlayed?: (idx: number) => void): void {
    if (this.isMuted || frequencies.length === 0) return;
    frequencies.forEach((freq, idx) => {
      setTimeout(() => {
        this.playPluck(freq, 0.7, 0.8);
        if (onNotePlayed) onNotePlayed(idx);
      }, idx * noteDelayMs);
    });
  }

  /**
   * Correct Answer Chime
   */
  public playCorrectSound(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const chimeFreqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      chimeFreqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.08);

        gain.gain.setValueAtTime(0.0001, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.6);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Wrong Answer Buzzer
   */
  public playWrongSound(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // ignore
    }
  }

  /**
   * Metronome Click
   */
  public playMetronomeTick(isAccent: boolean = false): void {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? 1200 : 800, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // ignore
    }
  }

  public stopMetronome(): void {
    if (this.metronomeTimer !== null) {
      clearInterval(this.metronomeTimer);
      this.metronomeTimer = null;
    }
  }
}

export const soundEngine = new GuitarAudioEngine();
