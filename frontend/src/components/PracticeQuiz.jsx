import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchQuestionsByCourse, submitAttempt, fetchCourses } from '../lib/practiceApi';

const PracticeQuiz = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const practiceType = searchParams.get('type') === 'technical'
    ? 'technical'
    : searchParams.get('type') === 'aptitude'
    ? 'aptitude'
    : 'mixed';

  useEffect(() => {
    const load = async () => {
      try {
        const [courseList, questionList] = await Promise.all([
          fetchCourses(),
          fetchQuestionsByCourse(courseId, { type: practiceType })
        ]);
        setCourse(courseList.find((c) => c._id === courseId) || null);
        setQuestions(questionList || []);
        setAnswers({});
      } catch (err) {
        console.error('Failed to load quiz', err);
        toast.error('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    load();
  }, [courseId, practiceType]);

  const handleChange = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questions.length) return;

    const unanswered = questions.filter((q) => answers[q._id] === undefined);
    if (unanswered.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        courseId,
        answers: questions.map((q) => ({
          questionId: q._id,
          selectedOption: answers[q._id]
        }))
      };
      const attempt = await submitAttempt(payload);
      navigate(`/practice/${courseId}/result`, { state: { attempt } });
    } catch (err) {
      console.error('Failed to submit attempt', err);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Practice Quiz</h1>
            <p className="text-sm text-gray-600">
              {practiceType === 'technical'
                ? 'Technical Question Practice (medium & hard questions)'
                : practiceType === 'aptitude'
                ? 'Aptitude Question Practice (easy questions)'
                : 'Mixed practice from all difficulty levels.'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Showing {questions.length} {practiceType === 'mixed' ? '' : practiceType + ' '}questions for this course.
            </p>
          </div>
          <button
            onClick={() => navigate('/practice-courses')}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to courses
          </button>
        </div>

        {/* Questions list */}

        <h2 className="text-lg font-semibold text-gray-900 mb-3">Practice Questions</h2>

        {!questions.length ? (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            No questions available for this course yet.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q._id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-medium text-gray-900">
                    Q{idx + 1}. {q.text}
                  </h2>
                </div>
                <div className="mt-2 space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <label key={oIdx} className="flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name={q._id}
                        value={oIdx}
                        checked={answers[q._id] === oIdx}
                        onChange={() => handleChange(q._id, oIdx)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PracticeQuiz;
