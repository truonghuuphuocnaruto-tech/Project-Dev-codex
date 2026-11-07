/**
 * Web Audio API Sound Synthesizer cho Game Trinh Thám
 * Hoạt động 100% Client-side bằng thuật toán tổng hợp âm (pure synthesis).
 * Không phụ thuộc file âm thanh ngoài, 0% độ trễ, tin cậy tuyệt đối khi demo.
 */

class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted: boolean = false;
  private volume: number = 0.6;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  /**
   * Tạo bộ đệm tiếng ồn trắng (White noise buffer)
   */
  private createNoiseBuffer(duration: number): AudioBuffer | null {
    const ctx = this.getContext();
    if (!ctx) return null;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * 1. Tiếng gõ máy chữ (Typewriter Key Strike)
   * Giả lập tiếng va cơ học đanh gọn của phím máy chữ cổ điển kèm dao động ngẫu nhiên.
   */
  public playTypewriter(): void {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    // Dao động cao độ ngẫu nhiên để mô phỏng gõ các phím khác nhau
    const pitchRandom = 0.9 + Math.random() * 0.2;

    // Tiếng click kim loại đanh
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(750 * pitchRandom, now);
    osc.frequency.exponentialRampToValueAtTime(140 * pitchRandom, now + 0.035);

    oscGain.gain.setValueAtTime(0.28, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);

    // Tiếng xước cơ học (Mechanical noise burst)
    const noiseBuffer = this.createNoiseBuffer(0.04);
    if (noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200 * pitchRandom, now);
      filter.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.04);
    }
  }

  /**
   * 2. Tiếng lật giấy hồ sơ (Page Flip / File Rustle)
   * Tiếng xột xoạt êm của trang giấy hồ sơ điều tra được lật mở.
   */
  public playPageFlip(): void {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    const duration = 0.28;
    const noiseBuffer = this.createNoiseBuffer(duration);
    if (!noiseBuffer) return;

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  /**
   * 3. Tiếng nhặt/khám phá vật chứng (Collect Evidence / Clue Discovery)
   * Hợp âm chuông tinh thể lấp lánh (arpeggio chuông trong vắt) báo hiệu manh mối quan trọng.
   */
  public playEvidenceCollect(): void {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    // Chuỗi nốt thăng hoa: E5 (659Hz) -> G#5 (830Hz) -> B5 (987Hz) -> E6 (1318Hz)
    const notes = [659.25, 830.61, 987.77, 1318.51];

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Thêm chút dao động hài hòa nhẹ
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.frequency.setValueAtTime(freq * 2, startTime);
      shimmerGain.gain.setValueAtTime(0.04, startTime);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4);

      shimmer.connect(shimmerGain);
      shimmerGain.connect(this.masterGain!);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.95);
      shimmer.start(startTime);
      shimmer.stop(startTime + 0.45);
    });
  }

  /**
   * 4. Tiếng ghim lên bảng gỗ (Pin to Corkboard)
   * Âm trầm nén chắc nịch của lực ghim ngập vào bảng gỗ bần kèm tiếng lách cách.
   */
  public playPin(): void {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;

    // Tiếng thịch trầm (Cork thud)
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(170, now);
    thudOsc.frequency.exponentialRampToValueAtTime(38, now + 0.09);

    thudGain.gain.setValueAtTime(0.4, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    thudOsc.connect(thudGain);
    thudGain.connect(this.masterGain);

    thudOsc.start(now);
    thudOsc.stop(now + 0.1);

    // Tiếng đinh ghim kim loại nhọn (Metal tack snap)
    const noiseBuffer = this.createNoiseBuffer(0.035);
    if (noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3500, now);
      filter.Q.setValueAtTime(3, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.035);
    }
  }

  /**
   * 5. Tiếng nối dây chỉ đỏ (Red String Pluck / Connect)
   * Tiếng bật dây đàn căng nẩy (taut string twang/pluck) đặc trưng của bảng suy luận trinh thám.
   */
  public playStringConnect(): void {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;

    // Dao động dây đàn căng nẩy (Pluck string)
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Cao độ D4 (293.66Hz) với cú bẻ cong tần số nhẹ mô phỏng dây được kéo căng
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.linearRampToValueAtTime(293.66, now + 0.03);

    // Lọc âm mô phỏng dao động tự nhiên của sợi dây dù/chỉ len
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2800, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + 0.35);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * 6. Tiếng Piano bí ẩn / Kịch tính (Mysterious Piano Chord / Noir Sting)
   * Hợp âm thứ u tối, ngân vang kéo dài (D minor diminished) mang màu sắc trinh thám điều tra.
   */
  public playMysteryPiano(): void {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    // Hợp âm D minor 9 / Diminished huyền bí:
    // D2 (73.4Hz), A2 (110Hz), D3 (146.8Hz), F3 (174.6Hz), Ab3 (207.65Hz - nốt triton tạo sự rợn ngợp), C4 (261.6Hz)
    const chordFrequencies = [73.42, 110.0, 146.83, 174.61, 207.65, 261.63];

    chordFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const harmonicOsc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      harmonicOsc.type = 'sine';
      harmonicOsc.frequency.setValueAtTime(freq * 2, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(280, now + 3.0);

      // Phím trầm có độ ngân lâu hơn phím bổng
      const decayDuration = 2.6 + (chordFrequencies.length - idx) * 0.2;
      const initialGain = 0.16 / Math.sqrt(chordFrequencies.length);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(initialGain, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decayDuration);

      osc.connect(filter);
      harmonicOsc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      harmonicOsc.start(now);
      osc.stop(now + decayDuration + 0.05);
      harmonicOsc.stop(now + decayDuration + 0.05);
    });
  }

  /**
   * 7. Tiếng phát hiện mâu thuẫn lời khai (Contradiction / Dramatic Objection)
   */
  public playContradiction(): void {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    const freqs = [185.0, 246.94, 311.13, 440.0]; // F#3 - B3 - D#4 - A4

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, now);
      filter.Q.setValueAtTime(2, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + 0.7);
    });
  }

  /**
   * 8. Tiếng phá án thành công (Success / Solved Fanfare)
   */
  public playSuccess(): void {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
    notes.forEach((freq, i) => {
      const noteTime = now + i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.28, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 1.25);
    });
  }

  /**
   * 9. Tiếng bấm nút giao diện nhẹ (UI Click)
   */
  public playClick(): void {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.025);
  }
}

export const audioManager = new WebAudioEngine();

// Convenience exports cho từng hiệu ứng âm thanh
export const playTypewriter = () => audioManager.playTypewriter();
export const playPageFlip = () => audioManager.playPageFlip();
export const playEvidenceCollect = () => audioManager.playEvidenceCollect();
export const playPin = () => audioManager.playPin();
export const playStringConnect = () => audioManager.playStringConnect();
export const playMysteryPiano = () => audioManager.playMysteryPiano();
export const playContradiction = () => audioManager.playContradiction();
export const playSuccess = () => audioManager.playSuccess();
export const playClick = () => audioManager.playClick();
export const toggleAudioMute = () => audioManager.toggleMute();
export const isAudioMuted = () => audioManager.isMuted();
export const setAudioMuted = (muted: boolean) => audioManager.setMuted(muted);
export const setMasterVolume = (vol: number) => audioManager.setVolume(vol);
export const getMasterVolume = () => audioManager.getVolume();
