import React, { useEffect, useState } from 'react';
import AdminHeader from './AdminHeader';
import {
  fetchCourses,
  fetchQuestionsByCourse,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../lib/practiceApi';

const AdminPracticeQuestions = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form, setForm] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    questionType: 'aptitude',
  });

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchCourses();
        setCourses(data || []);
        if (data && data.length > 0) {
          setSelectedCourseId(data[0]._id);
        }
      } catch (err) {
        setError('Failed to load courses');
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchQuestionsByCourse(selectedCourseId);
        setQuestions(data || []);
      } catch (err) {
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [selectedCourseId]);

  const resetForm = () => {
    setEditingQuestion(null);
    setForm({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      questionType: 'aptitude',
    });
  };

  const handleFormChange = (e, index) => {
    if (typeof index === 'number') {
      const newOptions = [...form.options];
      newOptions[index] = e.target.value;
      setForm((prev) => ({ ...prev, options: newOptions }));
    } else {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: name === 'correctAnswer' ? Number(value) : value }));
    }
  };

  const handleEditClick = (q) => {
    setEditingQuestion(q);
    setForm({
      text: q.text,
      options: q.options && q.options.length ? q.options : ['', '', '', ''],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      questionType: (q.difficulty || 'easy') === 'easy' ? 'aptitude' : 'technical',
    });
    setSuccess('');
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      setError('');
      await deleteQuestion(id);
      setSuccess('Question deleted');
      // reload
      const data = await fetchQuestionsByCourse(selectedCourseId);
      setQuestions(data || []);
    } catch (err) {
      setError('Failed to delete question');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setError('Please select a course first');
      return;
    }
    if (!form.text.trim()) {
      setError('Question text is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        course: selectedCourseId,
        text: form.text.trim(),
        options: form.options.map((o) => o.trim()).filter((o) => o !== ''),
        correctAnswer: form.correctAnswer,
        // Map question type to backend difficulty field
        difficulty: form.questionType === 'technical' ? 'medium' : 'easy',
      };

      if (!payload.options || payload.options.length < 2) {
        setError('Please provide at least 2 options');
        setSaving(false);
        return;
      }
      if (
        typeof payload.correctAnswer !== 'number' ||
        payload.correctAnswer < 0 ||
        payload.correctAnswer >= payload.options.length
      ) {
        setError('Correct option index is invalid');
        setSaving(false);
        return;
      }

      if (editingQuestion) {
        await updateQuestion(editingQuestion._id, payload);
        setSuccess('Question updated successfully');
      } else {
        await createQuestion(payload);
        setSuccess('Question created successfully');
      }

      const data = await fetchQuestionsByCourse(selectedCourseId);
      setQuestions(data || []);
      resetForm();
    } catch (err) {
      console.error('Save question error:', err);
      const backendError =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Failed to save question';
      setError(backendError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="user-management-container" style={{ padding: '1.5rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>📚 Practice Questions Management</h1>

        {error && (
          <div className="error-message" style={{ marginBottom: '0.75rem' }}>
            {error}
            <button
              onClick={() => setError('')}
              style={{ float: 'right', background: 'none', border: 'none', color: '#c53030', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="success-message" style={{ marginBottom: '0.75rem' }}>
            {success}
            <button
              onClick={() => setSuccess('')}
              style={{ float: 'right', background: 'none', border: 'none', color: '#2f855a', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Course selector */}
        <div className="user-filters" style={{ marginBottom: '1.5rem' }}>
          <div className="filter-group">
            <label>Course:</label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setQuestions([]);
                resetForm();
              }}
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Question form */}
        <div className="invite-form-container" style={{ marginBottom: '2rem' }}>
          <h2>{editingQuestion ? '✏️ Edit Question' : '➕ Add New Question'}</h2>
          <form className="invite-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="text">Question Text</label>
              <textarea
                id="text"
                name="text"
                value={form.text}
                onChange={handleFormChange}
                required
                rows={3}
                placeholder="Enter question text"
              />
            </div>

            <div className="form-group">
              <label>Options</label>
              {form.options.map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <input
                    type="radio"
                    name="correctAnswerRadio"
                    checked={form.correctAnswer === idx}
                    onChange={() => setForm((prev) => ({ ...prev, correctAnswer: idx }))}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleFormChange(e, idx)}
                    placeholder={`Option ${idx + 1}`}
                    style={{ flex: 1 }}
                  />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label htmlFor="questionType">Question Type</label>
              <select
                id="questionType"
                name="questionType"
                value={form.questionType}
                onChange={handleFormChange}
              >
                <option value="aptitude">Aptitude</option>
                <option value="technical">Technical</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={saving}>
                {saving ? 'Saving...' : editingQuestion ? 'Update Question' : 'Create Question'}
              </button>
              {editingQuestion && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetForm}
                  style={{ marginLeft: '0.5rem' }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Questions list */}
        <div className="users-list">
          <h2>Questions ({questions.length})</h2>
          {loading ? (
            <div className="user-management-loading">Loading questions...</div>
          ) : questions.length === 0 ? (
            <div className="no-users">No questions found for this course.</div>
          ) : (
            <div className="users-grid">
              {questions.map((q) => (
                <div key={q._id} className="user-card">
                  <div className="user-info">
                    <div className="user-details">
                      <h3 style={{ marginBottom: '0.35rem' }}>{q.text}</h3>
                      <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.35rem' }}>
                        {q.options.map((opt, idx) => (
                          <li key={idx} style={{ fontSize: '0.9rem' }}>
                            {idx === q.correctAnswer ? <strong>{idx + 1}. {opt}</strong> : `${idx + 1}. ${opt}`}
                          </li>
                        ))}
                      </ul>
                      {/* Question type / difficulty is intentionally hidden in admin UI */}
                    </div>
                  </div>
                  <div className="user-actions">
                    <button
                      className="toggle-status-btn"
                      type="button"
                      onClick={() => handleEditClick(q)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="delete-user-btn"
                      type="button"
                      onClick={() => handleDelete(q._id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminPracticeQuestions;
