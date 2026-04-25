import { useState } from 'react';
import { useGame } from '../context/GameContext';
import styles from './GameOverScreen.module.css';

export default function GameOverScreen({ score, rank, onRestart, onMenu }) {
  const { state } = useGame();
  const isHighScore = score >= state.highScore && score > 0;
  const [showConfetti] = useState(isHighScore);

  return (
    <div className={styles.screen}>
      {showConfetti && <Confetti />}

      <div className={styles.card}>
        <div className={styles.gameOverText}>GAME OVER</div>

        {isHighScore && (
          <div className={styles.newHighScore}>
            ⭐ NEW PERSONAL BEST!
          </div>
        )}

        <div className={styles.scoreSection}>
          <div className={styles.scoreLabel}>FINAL SCORE</div>
          <div className={styles.scoreValue}>{score}</div>
        </div>

        {rank && (
          <div className={styles.rankBadge}>
            #{rank} on the leaderboard
          </div>
        )}

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>PLAYER</span>
            <span className={styles.metaVal}>{state.playerName || 'Anonymous'}</span>
          </span>
          <span className={styles.metaDivider}>·</span>
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>MODE</span>
            <span className={styles.metaVal}>{state.difficulty.toUpperCase()}</span>
          </span>
        </div>

        <div className={styles.actions}>
          <button className={styles.restartBtn} onClick={onRestart}>
            ↻ PLAY AGAIN
          </button>
          <button className={styles.menuBtn} onClick={onMenu}>
            ← MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: ['#FF3366', '#FFD700', '#00FF88', '#00BFFF', '#BF00FF'][i % 5],
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    size: 6 + Math.random() * 8,
  }));

  return (
    <div className={styles.confettiContainer}>
      {pieces.map(p => (
        <div
          key={p.id}
          className={styles.confettiPiece}
          style={{
            left: `${p.x}%`,
            background: p.color,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            boxShadow: `0 0 6px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}
