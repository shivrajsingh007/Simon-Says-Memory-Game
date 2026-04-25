import { useState } from 'react';
import { useGame } from '../context/GameContext';
import styles from './MenuScreen.module.css';

const DIFFICULTIES = [
  { id: 'easy', label: 'EASY', desc: 'Slow pace · Forgiving', color: '#00FF88' },
  { id: 'normal', label: 'NORMAL', desc: 'Standard pace', color: '#00BFFF' },
  { id: 'hard', label: 'HARD', desc: 'Fast · No mercy', color: '#FF3366' },
];

export default function MenuScreen({ onStart }) {
  const { state, dispatch } = useGame();
  const [name, setName] = useState(state.playerName);

  const handleStart = () => {
    const trimmed = name.trim() || 'Anonymous';
    dispatch({ type: 'SET_PLAYER_NAME', payload: trimmed });
    onStart();
  };

  return (
    <div className={styles.menu}>
      {/* Title */}
      <div className={styles.titleBlock}>
        <div className={styles.subtitle}>MEMORY CHALLENGE</div>
        <h1 className={styles.title}>
          <span className={styles.s}>S</span>
          <span className={styles.i}>I</span>
          <span className={styles.m}>M</span>
          <span className={styles.o}>O</span>
          <span className={styles.n}>N</span>
        </h1>
        <div className={styles.tagline}>How long can you remember?</div>
      </div>

      {/* High Score Badge */}
      {state.highScore > 0 && (
        <div className={styles.highScore}>
          <span className={styles.highScoreLabel}>PERSONAL BEST</span>
          <span className={styles.highScoreVal}>{state.highScore}</span>
        </div>
      )}

      {/* Name Input */}
      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>YOUR CALLSIGN</label>
        <input
          className={styles.nameInput}
          type="text"
          value={name}
          onChange={e => setName(e.target.value.slice(0, 20))}
          placeholder="Enter name..."
          maxLength={20}
          onKeyDown={e => e.key === 'Enter' && handleStart()}
        />
      </div>

      {/* Difficulty */}
      <div className={styles.diffSection}>
        <div className={styles.diffLabel}>DIFFICULTY</div>
        <div className={styles.diffButtons}>
          {DIFFICULTIES.map(d => (
            <button
              key={d.id}
              className={`${styles.diffBtn} ${state.difficulty === d.id ? styles.diffActive : ''}`}
              style={{ '--diff-color': d.color }}
              onClick={() => dispatch({ type: 'SET_DIFFICULTY', payload: d.id })}
            >
              <span className={styles.diffName}>{d.label}</span>
              <span className={styles.diffDesc}>{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button className={styles.startBtn} onClick={handleStart}>
          <span>START GAME</span>
          <div className={styles.startBtnGlow} />
        </button>
        <button
          className={styles.lbBtn}
          onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'leaderboard' })}
        >
          🏆 LEADERBOARD
        </button>
      </div>

      {/* Color dots decoration */}
      <div className={styles.colorDots}>
        {['#FF3366', '#FFD700', '#00FF88', '#00BFFF'].map((c, i) => (
          <div key={i} className={styles.dot} style={{ background: c, boxShadow: `0 0 20px ${c}` }} />
        ))}
      </div>
    </div>
  );
}
