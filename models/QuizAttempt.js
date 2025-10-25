import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizType: {
    type: String,
    required: true,
    enum: ['flag', 'capitals', 'geography', 'emoji-movie']
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number,
    required: true,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster querying by user
quizAttemptSchema.index({ user: 1, date: -1 });

// Add virtual field for accuracy
quizAttemptSchema.virtual('accuracy').get(function() {
  return this.totalQuestions > 0 ? (this.correctAnswers / this.totalQuestions) * 100 : 0;
});

export default mongoose.model('QuizAttempt', quizAttemptSchema);