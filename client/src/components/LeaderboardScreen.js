import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getLeaderboard } from '../api';
import styles from './LeaderboardScreen.module.css';

const DIFFICULTIES = ['easy', 'normal', 'hard'];
const DIFF_COLORS = { easy: '#00FF88', normal: '#00BFFF', hard: '#FF3366' };

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen({ onBack }) {
  const { state } = useGame();
  const [activeDiff, setActiveDiff] = useState(state.difficulty);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getLeaderboard(activeDiff, 10).then(res => {
      if (cancelled) return;
      if (res.success) {
        setScores(res.scores);
      } else {
        setError('Could not load scores. Is the server running?');
        setScores([]);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [activeDiff]);

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onBack}>← BACK</button>
          <h2 className={styles.title}>🏆 LEADERBOARD</h2>
          <div style={{ width: 80 }} />
        </div>

        {/* Difficulty tabs */}
        <div className={styles.tabs}>
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              className={`${styles.tab} ${activeDiff === d ? styles.tabActive : ''}`}
              style={{ '--tab-color': DIFF_COLORS[d] }}
              onClick={() => setActiveDiff(d)}
            >
              {d.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Scores list */}
        <div className={styles.list}>
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              Loading...
            </div>
          )}

          {error && !loading && (
            <div className={styles.error}>{error}</div>
          )}

          {!loading && !error && scores.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🎮</div>
              <div>No scores yet for {activeDiff}.</div>
              <div className={styles.emptySubtitle}>Be the first to set a record!</div>
            </div>
          )}

          {!loading && scores.map((entry, i) => (
            <div
              key={entry._id || i}
              className={`${styles.row} ${i < 3 ? styles.topRow : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={styles.rank}>
                {i < 3 ? MEDALS[i] : <span className={styles.rankNum}>#{i + 1}</span>}
              </div>
              <div className={styles.playerInfo}>
                <div className={styles.playerName}>{entry.playerName}</div>
                <div className={styles.playerDate}>
                  {new Date(entry.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className={styles.scoreVal} style={{ color: DIFF_COLORS[activeDiff] }}>
                {entry.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
