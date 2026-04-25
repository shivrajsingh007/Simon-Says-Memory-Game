import React, { createContext, useContext, useReducer } from 'react';

const GameContext = createContext(null);

const initialState = {
  screen: 'menu',        // menu | game | gameover | leaderboard
  playerName: localStorage.getItem('simonPlayerName') || '',
  difficulty: 'normal',  // easy | normal | hard
  highScore: parseInt(localStorage.getItem('simonHighScore') || '0'),
  lastScore: 0,
  lastRank: null,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };
    case 'SET_PLAYER_NAME':
      localStorage.setItem('simonPlayerName', action.payload);
      return { ...state, playerName: action.payload };
    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.payload };
    case 'SET_LAST_SCORE':
      const newHigh = Math.max(state.highScore, action.payload);
      localStorage.setItem('simonHighScore', String(newHigh));
      return { ...state, lastScore: action.payload, highScore: newHigh };
    case 'SET_LAST_RANK':
      return { ...state, lastRank: action.payload };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
