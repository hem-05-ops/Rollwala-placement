const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length >= 2;
        },
        message: 'Question must have at least two options',
      },
      required: true,
    },
    correctAnswer: { type: Number, required: true }, // index in options array
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
