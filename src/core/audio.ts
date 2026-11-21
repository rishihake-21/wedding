/**
 * Audio manager for the Vrindavan invitation.
 *
 * Uses Howler when licensed audio tracks are wired in `ASSET_MANIFEST.audio`,
 * and seamlessly falls back to a calm procedural Web Audio synthesizer
 * (Raag Bhupali bansuri phrases, soft tanpura drone, ghungroo anklet bells,
 * temple bells, and shehnai chord swell) so the invitation sounds devotional
 * with zero 404 requests.
 *
 * Handles:
 * - Browser autoplay unlock on the Entry Gate tap
 * - Smooth gain fades
 * - Global mute toggle
 * - Auto-fade & pause when the browser tab becomes hidden (`visibilitychange`)
 */

import { Howl, Howler } from 'howler';
import { ASSET_MANIFEST, hasRealAsset } from '../assets/manifest';

export type AudioCue = 'anklet' | 'bells' | 'shehnai' | 'diya' | 'flute';

// Raag Bhupali (pentatonic: Sa Re Ga Pa Dha Sa' — devotional evening raga) in Hz (C# tonic ~277.18Hz)
const BHUPALI_NOTES = [277.18, 311.13, 349.23, 415.3, 466.16, 554.37, 622.25, 698.46];
const MELODY_SEQUENCE = [0, 2, 3, 4, 5, 4, 3, 2, 3, 2, 1, 0, 2, 3, 5, 4];

class VrindavanAudioManager {
  private unlocked = false;
  private muted = false;
  private hidden = false;
  private playingAmbient = false;

  private ambientHowl: Howl | null = null;
  private cueHowls: Partial<Record<AudioCue, Howl>> = {};

  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOscs: OscillatorNode[] = [];
  private melodyTimer: number | null = null;
  private noteIndex = 0;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.0001;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /** Must be invoked inside a user gesture (Enter button tap). */
  public unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;

    Howler.mute(this.muted);
    this.ensureContext();
    this.initHowls();
    this.startAmbient();
  }

  private initHowls(): void {
    const { ambientBansuri, ankletCue, venueBells, dateShehnai } = ASSET_MANIFEST.audio;
    if (hasRealAsset(ambientBansuri) && !this.ambientHowl) {
      this.ambientHowl = new Howl({
        src: [ambientBansuri],
        loop: true,
        volume: 0,
      });
    }
    const cueMap: [AudioCue, string | null][] = [
      ['anklet', ankletCue],
      ['bells', venueBells],
      ['shehnai', dateShehnai],
    ];
    for (const [key, src] of cueMap) {
      if (hasRealAsset(src) && !this.cueHowls[key]) {
        this.cueHowls[key] = new Howl({ src: [src], volume: 0.45 });
      }
    }
  }

  public startAmbient(): void {
    if (!this.unlocked || this.playingAmbient) return;
    this.playingAmbient = true;

    if (this.ambientHowl) {
      this.ambientHowl.play();
      if (!this.muted && !this.hidden) {
        this.ambientHowl.fade(0, 0.4, 1800);
      }
      return;
    }

    this.startProceduralAmbient();
  }

  private startProceduralAmbient(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    this.fadeMaster(this.muted || this.hidden ? 0.0001 : 0.24, 1.8);

    // Gentle tanpura Sa–Pa–Sa drone
    if (this.droneOscs.length === 0) {
      const droneFreqs = [138.59, 207.65, 277.18];
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.06;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 420;
      droneGain.connect(filter);
      filter.connect(this.masterGain);

      for (const freq of droneFreqs) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(droneGain);
        osc.start();
        this.droneOscs.push(osc);
      }
    }

    if (this.melodyTimer === null) {
      this.scheduleNextFluteNote();
    }
  }

  private scheduleNextFluteNote(): void {
    if (!this.playingAmbient) return;
    const freq = BHUPALI_NOTES[MELODY_SEQUENCE[this.noteIndex % MELODY_SEQUENCE.length]];
    this.noteIndex++;

    if (!this.muted && !this.hidden) {
      this.synthBansuriNote(freq, 2.2, 0.22);
    }

    const delayMs = 2100 + (this.noteIndex % 3 === 0 ? 900 : 0);
    this.melodyTimer = window.setTimeout(() => this.scheduleNextFluteNote(), delayMs);
  }

  private synthBansuriNote(freq: number, durationSec: number, gainPeak: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain || ctx.state !== 'running') return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 0.992, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.14);

    // Soft breath vibrato
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 4.6;
    lfoGain.gain.value = freq * 0.008;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = freq * 2.4;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(gainPeak, now + 0.32);
    env.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(filter);
    filter.connect(env);
    env.connect(this.masterGain);

    osc.start(now);
    lfo.start(now);
    osc.stop(now + durationSec + 0.05);
    lfo.stop(now + durationSec + 0.05);
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    Howler.mute(muted);

    if (this.ambientHowl) {
      this.ambientHowl.fade(this.ambientHowl.volume(), muted || this.hidden ? 0 : 0.4, 450);
    }
    if (this.ctx && this.masterGain) {
      this.fadeMaster(muted || this.hidden ? 0.0001 : 0.24, 0.45);
    }
  }

  public playCue(cue: AudioCue): void {
    if (!this.unlocked || this.muted || this.hidden) return;

    const real = this.cueHowls[cue];
    if (real) {
      real.play();
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;

    if (cue === 'anklet') {
      // Soft metallic ghungroo shimmer (high harmonic chimes)
      [2217, 2793, 3322, 3951].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t0 = now + idx * 0.06;
        env.gain.setValueAtTime(0.0001, t0);
        env.gain.linearRampToValueAtTime(0.06, t0 + 0.015);
        env.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
        osc.connect(env);
        env.connect(this.masterGain!);
        osc.start(t0);
        osc.stop(t0 + 0.4);
      });
    } else if (cue === 'bells') {
      // Temple bell overtones
      [554.37, 1108.73, 1661.22].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        env.gain.setValueAtTime(0.0001, now);
        env.gain.linearRampToValueAtTime(0.12 / (idx + 1), now + 0.02);
        env.gain.exponentialRampToValueAtTime(0.0001, now + 2.4 / (idx + 1));
        osc.connect(env);
        env.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 2.5);
      });
    } else if (cue === 'shehnai') {
      // Warm celebratory swell (Sa-Ga-Pa triad)
      [277.18, 349.23, 415.3].forEach((freq) => {
        this.synthBansuriNote(freq, 2.8, 0.14);
      });
    } else if (cue === 'diya') {
      this.synthBansuriNote(554.37, 0.9, 0.18);
      window.setTimeout(() => this.synthBansuriNote(698.46, 1.1, 0.14), 120);
    } else if (cue === 'flute') {
      const note = BHUPALI_NOTES[Math.floor(Math.random() * BHUPALI_NOTES.length)];
      this.synthBansuriNote(note, 1.4, 0.28);
    }
  }

  private fadeMaster(target: number, durationSec: number): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(this.masterGain.gain.value, 0.0001), now);
    this.masterGain.gain.exponentialRampToValueAtTime(Math.max(target, 0.0001), now + durationSec);
  }

  private handleVisibilityChange = (): void => {
    this.hidden = document.hidden;
    if (!this.unlocked) return;

    if (this.hidden) {
      if (this.ambientHowl) {
        this.ambientHowl.fade(this.ambientHowl.volume(), 0, 350);
        window.setTimeout(() => {
          if (this.hidden) this.ambientHowl?.pause();
        }, 380);
      }
      this.fadeMaster(0.0001, 0.3);
      window.setTimeout(() => {
        if (this.hidden && this.ctx?.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
      }, 350);
    } else {
      if (this.ambientHowl && !this.ambientHowl.playing()) {
        this.ambientHowl.play();
      }
      if (this.ambientHowl && !this.muted) {
        this.ambientHowl.fade(0, 0.4, 600);
      }
      if (this.ctx?.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      if (!this.muted) {
        this.fadeMaster(0.24, 0.6);
      }
    }
  };
}

export const audioManager = new VrindavanAudioManager();
