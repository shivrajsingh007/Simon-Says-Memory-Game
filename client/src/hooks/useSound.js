import { useRef, useCallback, useEffect, useState } from 'react';

// Frequencies for each color (musical notes)
const COLOR_FREQUENCIES = {
  yellow: 392,   // G4
  red: 329.63,   // E4
  green: 261.63, // C4
  blue: 220,     // A3
};

export function useSound() {
  const audioCtxRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const bgNodesRef = useRef([]);
  const bgGainRef = useRef(null);
  const [bgPlaying, setBgPlaying] = useState(false);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((color, duration = 0.3) => {
    if (muted) return;
    try {
      const ctx = getCtx();
      const freq = COLOR_FREQUENCIES[color] || 440;
      const now = ctx.currentTime;

      // Oscillator
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Envelope
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Slight pitch sweep for feel
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 1.01, now + duration * 0.5);
      osc.frequency.linearRampToValueAtTime(freq, now + duration);

      // Reverb-like effect with a short delay
      const delay = ctx.createDelay(0.3);
      delay.delayTime.value = 0.08;
      const delayGain = ctx.createGain();
      delayGain.gain.value = 0.2;

      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.3);
    } catch (e) {
      // Silently fail if audio context not available
    }
  }, [muted, getCtx]);

  const playError = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;

      [180, 160, 140].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.2);
      });
    } catch (e) {}
  }, [muted, getCtx]);

  const playLevelUp = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const melody = [523.25, 659.25, 783.99, 1046.5];

      melody.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.4, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } catch (e) {}
  }, [muted, getCtx]);

  const startBgMusic = useCallback(() => {
    if (muted || bgPlaying) return;
    try {
      const ctx = getCtx();
      setBgPlaying(true);

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.06;
      masterGain.connect(ctx.destination);
      bgGainRef.current = masterGain;

      // Ambient drone with slowly evolving chords
      const chordFreqs = [
        [55, 82.41, 110, 164.81],
        [61.74, 92.50, 123.47, 185],
        [55, 73.42, 110, 146.83],
        [49, 73.42, 98, 146.83],
      ];

      let chordIdx = 0;
      let activeOscs = [];

      const playChord = () => {
        // Fade out old
        activeOscs.forEach(o => {
          try {
            const now = ctx.currentTime;
            o.gainNode.gain.linearRampToValueAtTime(0, now + 1.5);
            o.osc.stop(now + 1.6);
          } catch (e) {}
        });
        activeOscs = [];

        const freqs = chordFreqs[chordIdx % chordFreqs.length];
        chordIdx++;

        freqs.forEach((freq, i) => {
          try {
            const osc = ctx.createOscillator();
            osc.type = i % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.value = freq;

            // Slow vibrato
            const lfo = ctx.createOscillator();
            lfo.frequency.value = 0.3 + i * 0.1;
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = freq * 0.003;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);

            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 2);

            osc.connect(gainNode);
            gainNode.connect(masterGain);
            osc.start();
            lfo.start();

            activeOscs.push({ osc, gainNode, lfo });
          } catch (e) {}
        });
      };

      playChord();
      const intervalId = setInterval(playChord, 6000);
      bgNodesRef.current = [{ intervalId, activeOscs }];
    } catch (e) {}
  }, [muted, bgPlaying, getCtx]);

  const stopBgMusic = useCallback(() => {
    setBgPlaying(false);
    bgNodesRef.current.forEach(({ intervalId, activeOscs }) => {
      clearInterval(intervalId);
      activeOscs?.forEach(o => {
        try { o.osc.stop(); } catch (e) {}
        try { o.lfo.stop(); } catch (e) {}
      });
    });
    bgNodesRef.current = [];
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(m => {
      if (!m) stopBgMusic();
      return !m;
    });
  }, [stopBgMusic]);

  useEffect(() => {
    return () => {
      stopBgMusic();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [stopBgMusic]);

  return { playTone, playError, playLevelUp, startBgMusic, stopBgMusic, toggleMute, muted, bgPlaying };
}
