import { useState, useCallback } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import ParticleBackground from './components/ParticleBackground';
import MenuScreen from './components/MenuScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import './App.css';

function AppInner() {
  const { state, dispatch } = useGame();
  const [gameKey, setGameKey] = useState(0); // force remount on restart
  const [lastScore, setLastScore] = useState(0);
  const [lastRank, setLastRank] = useState(null);
  const [bgColor, setBgColor] = useState('default');

  const handleStart = useCallback(() => {
    setGameKey(k => k + 1);
    dispatch({ type: 'SET_SCREEN', payload: 'game' });
    setBgColor('default');
  }, [dispatch]);

  const handleGameOver = useCallback((score, rank) => {
    dispatch({ type: 'SET_LAST_SCORE', payload: score });
    setLastScore(score);
    setLastRank(rank);
    dispatch({ type: 'SET_SCREEN', payload: 'gameover' });
    setBgColor('red');
    setTimeout(() => setBgColor('default'), 1200);
  }, [dispatch]);

  const handleMenu = useCallback(() => {
    dispatch({ type: 'SET_SCREEN', payload: 'menu' });
    setBgColor('default');
  }, [dispatch]);

  const handleLeaderboard = useCallback(() => {
    dispatch({ type: 'SET_SCREEN', payload: 'leaderboard' });
  }, [dispatch]);

  return (
    <div className="app">
      <ParticleBackground color={bgColor} />

      {state.screen === 'menu' && (
        <MenuScreen onStart={handleStart} />
      )}

      {state.screen === 'game' && (
        <GameScreen
          key={gameKey}
          onGameOver={handleGameOver}
        />
      )}

      {state.screen === 'gameover' && (
        <GameOverScreen
          score={lastScore}
          rank={lastRank}
          onRestart={handleStart}
          onMenu={handleMenu}
          onLeaderboard={handleLeaderboard}
        />
      )}

      {state.screen === 'leaderboard' && (
        <LeaderboardScreen onBack={handleMenu} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  );
}
