import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useSound } from '../hooks/useSound';
import { saveScore } from '../api';
import styles from './GameScreen.module.css';

const COLORS = ['red', 'yellow', 'green', 'blue'];

const COLOR_STYLES = {
  red:    { base: '#FF3366', glow: '#FF336688', label: '1' },
  yellow: { base: '#FFD700', glow: '#FFD70088', label: '2' },
  green:  { base: '#00FF88', glow: '#00FF8888', label: '3' },
  blue:   { base: '#00BFFF', glow: '#00BFFF88', label: '4' },
};

const DIFFICULTY_CONFIG = {
  easy:   { flashDuration: 600, pauseBetween: 500, sequenceDelay: 400 },
  normal: { flashDuration: 400, pauseBetween: 350, sequenceDelay: 350 },
  hard:   { flashDuration: 250, pauseBetween: 200, sequenceDelay: 250 },
};

export default function GameScreen({ onGameOver }) {
  const { state } = useGame();
  const { playTone, playError, playLevelUp, startBgMusic, stopBgMusic, toggleMute, muted, bgPlaying } = useSound();

  const [gameSeq, setGameSeq] = useState([]);
  const [userSeq, setUserSeq] = useState([]);
  const [level, setLevel] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | showing | input | paused | gameover
  const [activeBtn, setActiveBtn] = useState(null);
  const [statusMsg, setStatusMsg] = useState('GET READY');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showFlash, setShowFlash] = useState(false); // game over red flash
  const [isPaused, setIsPaused] = useState(false);

  const phaseRef = useRef(phase);
  const gameSeqRef = useRef(gameSeq);
  const levelRef = useRef(level);
  phaseRef.current = phase;
  gameSeqRef.current = gameSeq;
  levelRef.current = level;

  const config = DIFFICULTY_CONFIG[state.difficulty];

  // Start bg music on mount
  useEffect(() => {
    startBgMusic();
    return () => stopBgMusic();
    // eslint-disable-next-line
  }, []);

  // Kick off game
  useEffect(() => {
    const timer = setTimeout(() => nextLevel([]), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, []);

  const flashButton = useCallback((color, duration) => {
    return new Promise(resolve => {
      playTone(color, duration / 1000);
      setActiveBtn(color);
      setTimeout(() => {
        setActiveBtn(null);
        resolve();
      }, duration);
    });
  }, [playTone]);

  const showSequence = useCallback(async (seq) => {
    setPhase('showing');
    setStatusMsg('WATCH CAREFULLY...');
    await new Promise(r => setTimeout(r, config.sequenceDelay));

    for (const color of seq) {
      if (phaseRef.current === 'gameover') return;
      await flashButton(color, config.flashDuration);
      await new Promise(r => setTimeout(r, config.pauseBetween));
    }

    setPhase('input');
    setStatusMsg('YOUR TURN!');
  }, [config, flashButton]);

  const nextLevel = useCallback((currentSeq) => {
    const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newSeq = [...currentSeq, newColor];
    const newLevel = newSeq.length;

    setGameSeq(newSeq);
    gameSeqRef.current = newSeq;
    setLevel(newLevel);
    levelRef.current = newLevel;
    setUserSeq([]);
    playLevelUp();

    showSequence(newSeq);
  }, [playLevelUp, showSequence]);

  const handleButtonClick = useCallback((color) => {
    if (phase !== 'input' || isPaused) return;

    const newUserSeq = [...userSeq, color];
    setUserSeq(newUserSeq);
    setActiveBtn(color);
    setTimeout(() => setActiveBtn(null), 180);
    playTone(color, 0.25);

    const idx = newUserSeq.length - 1;
    if (newUserSeq[idx] !== gameSeqRef.current[idx]) {
      // Wrong!
      playError();
      setPhase('gameover');
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 600);
      setStatusMsg(`WRONG! LEVEL ${levelRef.current} REACHED`);
      setCombo(0);

      // Save score
      const finalScore = score;
      saveScore({
        playerName: state.playerName || 'Anonymous',
        score: finalScore > 0 ? finalScore : levelRef.current,
        difficulty: state.difficulty,
      }).then(res => {
        if (res.rank) {
          onGameOver(finalScore > 0 ? finalScore : levelRef.current, res.rank);
        } else {
          onGameOver(finalScore > 0 ? finalScore : levelRef.current, null);
        }
      });
      return;
    }

    // Correct so far
    if (newUserSeq.length === gameSeqRef.current.length) {
      // Completed the level!
      const newCombo = combo + 1;
      setCombo(newCombo);
      const levelScore = levelRef.current * 10 * (newCombo >= 3 ? 2 : 1);
      setScore(s => s + levelScore);
      setStatusMsg(newCombo >= 3 ? `🔥 COMBO x${newCombo}!` : '✓ CORRECT!');
      setPhase('idle');

      setTimeout(() => {
        nextLevel(gameSeqRef.current);
      }, 700);
    }
  }, [phase, isPaused, userSeq, gameSeqRef, playTone, playError, score, combo, state.playerName, state.difficulty, onGameOver, nextLevel]);

  const handlePause = () => {
    if (phase === 'gameover') return;
    setIsPaused(p => {
      if (!p) {
        setStatusMsg('⏸ PAUSED');
      } else {
        setStatusMsg(phase === 'input' ? 'YOUR TURN!' : 'WATCH CAREFULLY...');
      }
      return !p;
    });
  };

  // Keyboard support
  useEffect(() => {
    const keyMap = { '1': 'red', '2': 'yellow', '3': 'green', '4': 'blue' };
    const handleKey = (e) => {
      if (keyMap[e.key]) handleButtonClick(keyMap[e.key]);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleButtonClick]);

  const progressPct = gameSeq.length > 0
    ? Math.round((userSeq.length / gameSeq.length) * 100)
    : 0;

  return (
    <div className={`${styles.game} ${showFlash ? styles.errorFlash : ''}`}>
      {/* HUD */}
      <div className={styles.hud}>
        <div className={styles.hudBlock}>
          <div className={styles.hudLabel}>LEVEL</div>
          <div className={styles.hudValue}>{level}</div>
        </div>
        <div className={styles.hudCenter}>
          <div className={styles.status}>{statusMsg}</div>
          {phase === 'input' && (
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
            </div>
          )}
        </div>
        <div className={styles.hudBlock} style={{ textAlign: 'right' }}>
          <div className={styles.hudLabel}>SCORE</div>
          <div className={styles.hudValue}>{score}</div>
        </div>
      </div>

      {combo >= 3 && (
        <div className={styles.comboBadge}>
          🔥 COMBO x{combo}
        </div>
      )}

      {/* Buttons Grid */}
      <div className={styles.btnGrid}>
        {COLORS.map(color => {
          const cfg = COLOR_STYLES[color];
          const isActive = activeBtn === color;
          return (
            <button
              key={color}
              className={`${styles.btn} ${isActive ? styles.btnActive : ''} ${phase !== 'input' || isPaused ? styles.btnDisabled : ''}`}
              style={{
                '--btn-color': cfg.base,
                '--btn-glow': cfg.glow,
              }}
              onClick={() => handleButtonClick(color)}
              aria-label={color}
            >
              <span className={styles.btnLabel}>{cfg.label}</span>
              <div className={styles.btnShine} />
              {isActive && <div className={styles.btnPulse} />}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={handlePause} disabled={phase === 'gameover'}>
          {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>
        <button className={styles.ctrlBtn} onClick={toggleMute}>
          {muted ? '🔇 MUTED' : '🔊 SOUND'}
        </button>
        <button
          className={`${styles.ctrlBtn} ${styles.ctrlBtnDanger}`}
          onClick={() => onGameOver(score, null)}
        >
          ✕ QUIT
        </button>
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div className={styles.pauseOverlay}>
          <div className={styles.pauseCard}>
            <div className={styles.pauseTitle}>PAUSED</div>
            <div className={styles.pauseScore}>Score: {score}</div>
            <button className={styles.resumeBtn} onClick={handlePause}>▶ RESUME</button>
          </div>
        </div>
      )}
    </div>
  );
}
