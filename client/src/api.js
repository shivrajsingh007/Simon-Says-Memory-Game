const API_BASE = process.env.REACT_APP_API_URL || '/api';

export async function saveScore({ playerName, score, difficulty }) {
  try {
    const res = await fetch(`${API_BASE}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName, score, difficulty }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to save score:', err);
    return { success: false, message: 'Server unavailable' };
  }
}

export async function getLeaderboard(difficulty = 'normal', limit = 10) {
  try {
    const res = await fetch(`${API_BASE}/scores/leaderboard?difficulty=${difficulty}&limit=${limit}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    return { success: false, scores: [] };
  }
}

export async function getTopScores() {
  try {
    const res = await fetch(`${API_BASE}/scores/top`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Failed to fetch top scores:', err);
    return { success: false, scores: [] };
  }
}
