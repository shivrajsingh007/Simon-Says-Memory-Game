const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

// GET leaderboard - top 10 per difficulty
router.get('/leaderboard', async (req, res) => {
  try {
    const { difficulty = 'normal', limit = 10 } = req.query;
    const scores = await Score.find({ difficulty })
      .sort({ score: -1 })
      .limit(parseInt(limit))
      .select('playerName score difficulty createdAt');
    res.json({ success: true, scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all-time top scores across difficulties
router.get('/top', async (req, res) => {
  try {
    const scores = await Score.find()
      .sort({ score: -1 })
      .limit(20)
      .select('playerName score difficulty createdAt');
    res.json({ success: true, scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST save a score
router.post('/', async (req, res) => {
  try {
    const { playerName, score, difficulty } = req.body;
    if (!score || score < 1) {
      return res.status(400).json({ success: false, message: 'Invalid score' });
    }
    const newScore = new Score({
      playerName: playerName?.trim() || 'Anonymous',
      score,
      difficulty: difficulty || 'normal'
    });
    await newScore.save();

    // Return rank
    const rank = await Score.countDocuments({
      difficulty: newScore.difficulty,
      score: { $gt: newScore.score }
    });

    res.status(201).json({ success: true, score: newScore, rank: rank + 1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
