import express from 'express';
import auth from '../middleware/authMiddleware.js';
import QuizAttempt from '../models/QuizAttempt.js';

const router = express.Router();

// Save a quiz attempt
router.post('/attempts', auth, async (req, res) => {
  try {
    const { quizType, score, totalQuestions, correctAnswers, timeSpent } = req.body;
    
    const attempt = new QuizAttempt({
      user: req.user.id,
      quizType,
      score,
      totalQuestions,
      correctAnswers,
      timeSpent: timeSpent || 0
    });

    await attempt.save();
    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({ message: 'Error saving quiz attempt', error: error.message });
  }
});

// Get user's quiz attempts
router.get('/attempts', auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(50);  // Limit to last 50 attempts
    
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz attempts', error: error.message });
  }
});

// Get user's quiz statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await QuizAttempt.aggregate([
      { $match: { user: req.user._id } },
      { $group: {
        _id: '$quizType',
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score' },
        highestScore: { $max: '$score' },
        totalCorrectAnswers: { $sum: '$correctAnswers' },
        totalQuestions: { $sum: '$totalQuestions' },
        totalTimeSpent: { $sum: '$timeSpent' },
        recentAttempts: { 
          $push: {
            score: '$score',
            correctAnswers: '$correctAnswers',
            totalQuestions: '$totalQuestions',
            date: '$date'
          }
        }
      }},
      { $project: {
        quizType: '$_id',
        totalAttempts: 1,
        averageScore: { $round: ['$averageScore', 1] },
        highestScore: 1,
        totalCorrectAnswers: 1,
        totalQuestions: 1,
        totalTimeSpent: 1,
        recentAttempts: { $slice: ['$recentAttempts', -5] },
        accuracy: {
          $round: [
            { $multiply: [
              { $divide: ['$totalCorrectAnswers', '$totalQuestions'] },
              100
            ]},
            1
          ]
        }
      }}
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz statistics', error: error.message });
  }
});

export default router;