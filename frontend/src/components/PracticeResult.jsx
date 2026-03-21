import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const PracticeResult = () => {
  const { state } = useLocation();
  const { courseId } = useParams();
  const navigate = useNavigate();

  const attempt = state?.attempt;

  if (!attempt) {
    // Fallback: if user refreshes, just send them back to courses
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 mb-4">No attempt data found.</p>
        <button
          onClick={() => navigate('/practice-courses')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          Back to Practice Courses
        </button>
      </div>
    );
  }

  const { totalQuestions, correctCount, wrongCount, scorePercentage } = attempt;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz Result</h1>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm text-gray-700">
            <span>Total Questions</span>
            <span className="font-medium">{totalQuestions}</span>
          </div>
          <div className="flex justify-between text-sm text-green-700">
            <span>Correct Answers</span>
            <span className="font-medium">{correctCount}</span>
          </div>
          <div className="flex justify-between text-sm text-red-700">
            <span>Wrong Answers</span>
            <span className="font-medium">{wrongCount}</span>
          </div>
          <div className="flex justify-between text-sm text-blue-700">
            <span>Score %</span>
            <span className="font-semibold">{scorePercentage.toFixed(2)}%</span>
          </div>
        </div>

        <div className="flex justify-between gap-3">
          <button
            onClick={() => navigate(`/practice/${courseId}`)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Retry Quiz
          </button>
          <button
            onClick={() => navigate('/practice-courses')}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeResult;
