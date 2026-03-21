
import React, { useState, useEffect } from "react";
import "./interviewExperience.css";
import InterviewDetail from "./InterviewDetail";
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function InterviewExperience() {
  const [view, setView] = useState("read");
  const [filter, setFilter] = useState({ company: "", role: "" });
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    company: "", 
    role: "", 
    experience: "",
    package: "",
    difficulty: "Medium",
    rounds: [],
    tips: ""
  });
  const [selected, setSelected] = useState(null);

  // Fetch approved interview experiences from API
  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/interview-experiences/approved`);
      if (response.ok) {
        const data = await response.json();
        setExperiences(data);
      } else {
        console.error('Failed to fetch experiences');
        toast.error('Failed to load interview experiences');
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
      toast.error('Failed to load interview experiences');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filtered = experiences.filter(
    (exp) =>
      (!filter.company || exp.company.toLowerCase().includes(filter.company.toLowerCase())) &&
      (!filter.role || exp.role.toLowerCase().includes(filter.role.toLowerCase()))
  );

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to submit an interview experience');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/interview-experiences/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          company: form.company,
          role: form.role,
          experience: form.experience,
          package: form.package || undefined,
          difficulty: form.difficulty,
          rounds: form.rounds.filter(r => r.trim()),
          tips: form.tips || undefined
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || 'Interview experience submitted successfully! It will be reviewed by admin.');
        setForm({ 
          company: "", 
          role: "", 
          experience: "",
          package: "",
          difficulty: "Medium",
          rounds: [],
          tips: ""
        });
        setView("read");
        // Refresh experiences list
        fetchExperiences();
      } else {
        toast.error(data.error || 'Failed to submit experience');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit experience');
    } finally {
      setSubmitting(false);
    }
  };

  if (selected) {
    return <InterviewDetail experience={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="interview-experience-page fade-in">
      <div className="ie-hero">
        <h2 className="ie-title">Interview Experience Portal</h2>
        <p className="ie-desc">Share your interview journey or read others' experiences. Use the filters to find stories by company or role.</p>
      </div>
      <div className="ie-nav">
        <button className={view === "add" ? "active" : ""} onClick={() => setView("add")}>Add Interview Experience</button>
        <button className={view === "read" ? "active" : ""} onClick={() => setView("read")}>Read Interview Experience</button>
      </div>
      {view === "add" && (
        <form className="ie-form ie-form-redesign" onSubmit={handleFormSubmit}>
          <div className="ie-form-row">
            <div className="ie-form-group">
              <label htmlFor="company">Company Name</label>
              <input
                id="company"
                name="company"
                placeholder="e.g. Google, Amazon"
                value={form.company}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="ie-form-group">
              <label htmlFor="role">Role</label>
              <input
                id="role"
                name="role"
                placeholder="e.g. SDE, Analyst"
                value={form.role}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>
          <div className="ie-form-group">
            <label htmlFor="experience">Your Experience</label>
            <textarea
              id="experience"
              name="experience"
              placeholder="Share your interview experience in detail..."
              value={form.experience}
              onChange={handleFormChange}
              required
              rows={7}
            />
          </div>
          <div className="ie-form-group">
            <label htmlFor="package">Package (Optional)</label>
            <input
              id="package"
              name="package"
              placeholder="e.g. 12 LPA"
              value={form.package}
              onChange={handleFormChange}
            />
          </div>
          <div className="ie-form-group">
            <label htmlFor="difficulty">Difficulty Level</label>
            <select
              id="difficulty"
              name="difficulty"
              value={form.difficulty}
              onChange={handleFormChange}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="ie-form-group">
            <label htmlFor="tips">Tips & Advice (Optional)</label>
            <textarea
              id="tips"
              name="tips"
              placeholder="Share any tips or advice for future candidates..."
              value={form.tips}
              onChange={handleFormChange}
              rows={4}
            />
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Experience'}
          </button>
        </form>
      )}
      {view === "read" && (
        <div className="ie-read-section">
          <div className="ie-filters">
            <input
              name="company"
              placeholder="Filter by Company"
              value={filter.company}
              onChange={handleFilter}
            />
            <input
              name="role"
              placeholder="Filter by Role"
              value={filter.role}
              onChange={handleFilter}
            />
          </div>
          {loading ? (
            <div className="ie-loading">Loading interview experiences...</div>
          ) : (
            <ul className="ie-list ie-list-redesign">
              {filtered.length === 0 && <li className="ie-empty">No experiences found.</li>}
              {filtered.map((exp) => (
                <li key={exp._id || exp.id} className="ie-item ie-card" onClick={() => setSelected(exp)}>
                  <div className="ie-meta">
                    <span className="ie-company">{exp.company}</span>
                    <span className="ie-role">{exp.role}</span>
                    {exp.submittedBy && (
                      <span className="ie-submitted-by">by {exp.submittedBy}</span>
                    )}
                  </div>
                  <p className="ie-text">
                    {exp.experience && exp.experience.length > 120
                      ? exp.experience.slice(0, 120) + "..."
                      : exp.experience}
                  </p>
                  <div className="ie-card-actions">
                    <button className="ie-view-btn" onClick={e => {e.stopPropagation(); setSelected(exp);}}>Read</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
