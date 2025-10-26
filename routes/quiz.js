// routes/quiz.js
import express from 'express';
import mongoose from 'mongoose';
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
    console.error('Error saving quiz attempt:', error);
    res.status(500).json({ message: 'Error saving quiz attempt', error: error.message });
  }
});

// Get user's quiz attempts
router.get('/attempts', auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(50);
    
    res.json(attempts);
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({ message: 'Error fetching quiz attempts', error: error.message });
  }
});

// Get user's quiz statistics
router.get('/stats', auth, async (req, res) => {
  try {
    // Convert user ID to ObjectId for aggregation
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const stats = await QuizAttempt.aggregate([
      { 
        $match: { user: userId } 
      },
      { 
        $group: {
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
        }
      },
      { 
        $project: {
          _id: 0,
          quizType: '$_id',
          totalAttempts: 1,
          averageScore: { $round: ['$averageScore', 1] },
          highestScore: 1,
          totalCorrectAnswers: 1,
          totalQuestions: 1,
          totalTimeSpent: 1,
          recentAttempts: { $slice: ['$recentAttempts', -5] },
          accuracy: {
            $cond: {
              if: { $gt: ['$totalQuestions', 0] },
              then: {
                $round: [
                  { $multiply: [
                    { $divide: ['$totalCorrectAnswers', '$totalQuestions'] },
                    100
                  ]},
                  1
                ]
              },
              else: 0
            }
          }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching quiz statistics:', error);
    res.status(500).json({ message: 'Error fetching quiz statistics', error: error.message });
  }
});

// Get overall user statistics (optional - for dashboard summary)
router.get('/overall-stats', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const overallStats = await QuizAttempt.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalQuestions: { $sum: '$totalQuestions' },
          totalCorrectAnswers: { $sum: '$correctAnswers' },
          totalTimeSpent: { $sum: '$timeSpent' },
          highestScore: { $max: '$score' }
        }
      },
      {
        $project: {
          _id: 0,
          totalQuizzes: 1,
          totalQuestions: 1,
          totalCorrectAnswers: 1,
          wrongAnswers: { $subtract: ['$totalQuestions', '$totalCorrectAnswers'] },
          totalTimeSpent: 1,
          highestScore: 1,
          successRate: {
            $cond: {
              if: { $gt: ['$totalQuestions', 0] },
              then: {
                $round: [
                  { $multiply: [
                    { $divide: ['$totalCorrectAnswers', '$totalQuestions'] },
                    100
                  ]},
                  1
                ]
              },
              else: 0
            }
          }
        }
      }
    ]);

    res.json(overallStats.length > 0 ? overallStats[0] : {
      totalQuizzes: 0,
      totalQuestions: 0,
      totalCorrectAnswers: 0,
      wrongAnswers: 0,
      totalTimeSpent: 0,
      highestScore: 0,
      successRate: 0
    });
  } catch (error) {
    console.error('Error fetching overall statistics:', error);
    res.status(500).json({ message: 'Error fetching overall statistics', error: error.message });
  }
});

export default router;