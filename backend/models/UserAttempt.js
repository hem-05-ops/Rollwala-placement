const mongoose = require('mongoose');

const userAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    answers: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
        selectedOption: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
      },
    ],
    totalQuestions: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    wrongCount: { type: Number, required: true },
    scorePercentage: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserAttempt', userAttemptSchema);
