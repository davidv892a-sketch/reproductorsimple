import { EqualizerState } from '../types';

export const DEFAULT_EQ_BANDS = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQ_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [8, 6, 5, 2, 0, 0, 0, 1, 2, 3],
  Rock: [5, 4, 3, 1, -1, -1, 1, 3, 4, 5],
  Pop: [-1, 1, 3, 4, 4, 3, 1, 0, 1, 2],
  Jazz: [3, 2, 1, 2, -1, -1, 0, 1, 3, 4],
  Classical: [4, 3, 2, 2, -1, -1, 0, 2, 3, 4],
  'Heavy Metal': [6, 5, 2, 0, -1, 2, 4, 5, 4, 3],
  Vocal: [-2, -2, -1, 1, 4, 4, 3, 2, 0, -1],
  EDM: [7, 6, 3, 0, -2, 2, 1, 3, 5, 6],
  Acoustic: [3, 2, 1, 1, 2, 2, 3, 3, 2, 1],
  Custom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private preampGainNode: GainNode | null = null;
  private bassBoostNode: BiquadFilterNode | null = null;
  private volumeNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private isInitialized = false;

  public init(audioEl: HTMLAudioElement): void {
    if (this.isInitialized && this.audioElement === audioEl) return;
    this.audioElement = audioEl;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Create Media Source Node
      this.mediaSourceNode = this.ctx.createMediaElementSource(audioEl);

      // Preamp Gain Node
      this.preampGainNode = this.ctx.createGain();

      // Bass Boost low shelf filter (around 80Hz)
      this.bassBoostNode = this.ctx.createBiquadFilter();
      this.bassBoostNode.type = 'lowshelf';
      this.bassBoostNode.frequency.value = 80;

      // 10-Band Equalizer Filters
      this.eqFilters = DEFAULT_EQ_BANDS.map((freq, index) => {
        const filter = this.ctx!.createBiquadFilter();
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === DEFAULT_EQ_BANDS.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4; // Standard Q factor for 10-band EQ
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });

      // Stereo Panner / Virtualizer node
      if (this.ctx.createStereoPanner) {
        this.pannerNode = this.ctx.createStereoPanner();
      }

      // Volume / Booster Node
      this.volumeNode = this.ctx.createGain();

      // Analyser Node for Visualizer
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Connect graph: Source -> Preamp -> BassBoost -> EQ Filters (0-9) -> Stereo Panner -> Volume Booster -> Analyser -> Destination
      let currentNode: AudioNode = this.mediaSourceNode;

      currentNode.connect(this.preampGainNode);
      currentNode = this.preampGainNode;

      currentNode.connect(this.bassBoostNode);
      currentNode = this.bassBoostNode;

      for (const filter of this.eqFilters) {
        currentNode.connect(filter);
        currentNode = filter;
      }

      if (this.pannerNode) {
        currentNode.connect(this.pannerNode);
        currentNode = this.pannerNode;
      }

      currentNode.connect(this.volumeNode);
      currentNode = this.volumeNode;

      currentNode.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch (err) {
      console.warn('Web Audio API init warning/error:', err);
    }
  }

  public ensureContextRunning(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateEqualizer(eqState: EqualizerState): void {
    if (!this.isInitialized || !this.ctx) return;

    // Preamp
    if (this.preampGainNode) {
      // dB to linear gain conversion
      const preampVal = eqState.enabled ? eqState.preamp : 0;
      this.preampGainNode.gain.value = Math.pow(10, preampVal / 20);
    }

    // Bass Boost (0 to 100% -> 0 to +12dB)
    if (this.bassBoostNode) {
      const bassVal = eqState.enabled ? (eqState.bassBoost / 100) * 12 : 0;
      this.bassBoostNode.gain.value = bassVal;
    }

    // 10 Band gains
    this.eqFilters.forEach((filter, idx) => {
      if (idx < eqState.bands.length) {
        const gainVal = eqState.enabled ? eqState.bands[idx] : 0;
        filter.gain.value = gainVal;
      }
    });

    // Volume booster (100% to 200% gain)
    if (this.volumeNode) {
      const volBoostMultiplier = eqState.enabled ? eqState.volumeBooster / 100 : 1.0;
      this.volumeNode.gain.value = volBoostMultiplier;
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  public getFrequencyData(array: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(array);
    }
  }

  public getWaveformData(array: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteTimeDomainData(array);
    }
  }
}

export const audioEngine = new AudioEngine();
