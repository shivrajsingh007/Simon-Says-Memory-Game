const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
    default: 'Anonymous'
  },
  score: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'normal', 'hard'],
    default: 'normal'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for leaderboard queries
scoreSchema.index({ score: -1 });
scoreSchema.index({ difficulty: 1, score: -1 });

module.exports = mongoose.model('Score', scoreSchema);
